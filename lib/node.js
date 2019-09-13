import VowLink from '@vowlink/protocol';
import Storage from '@vowlink/sqlite-storage';
import Swarm from '@vowlink/swarm';
import sodium from 'sodium-universal';
import bs58 from 'bs58';
import { randomBytes } from 'crypto';

const INVITE_TIMEOUT = 15 * 60 * 1000; // 15 minutes

export default class ServerNode {
  constructor(options = {}) {
    this.options = options;
    if (!this.options.identity) {
      throw new Error('Missing required `identity` option');
    }
    if (!this.options.db) {
      throw new Error('Missing required `db` option');
    }
    if (!this.options.passphrase) {
      throw new Error('Missing required `passphrase` option');
    }

    this.storage = new Storage({ file: options.db });
    this.vowLink = null;
    this.swarm = null;

    this.identity = null;
  }

  async start() {
    await this.storage.open();

    this.vowLink = new VowLink({
      sodium,
      storage: this.storage,
      passphrase: this.options.passphrase,
    });

    await this.vowLink.load();

    this.swarm = new Swarm(this.vowLink);

    // Load or create new identity
    this.identity = this.vowLink.getIdentity(this.options.identity);
    if (!this.identity) {
      const [ identity ] = await this.vowLink.createIdentityPair(
        this.options.identity);
      this.identity = identity;
    }
  }

  async close() {
    if (this.vowLink) {
      await this.vowLink.close();
    }
    if (this.swarm) {
      await this.swarm.destroy();
    }
    await this.storage.close();
  }

  async addFeed(url) {
    url = new URL(url);
    if (url.protocol !== 'vowlink:') {
      throw new Error('Invalid protocol');
    }

    if (url.host !== 'feed') {
      throw new Error('Not feed URL');
    }

    if (!url.pathname.startsWith('/')) {
      throw new Error('Invalid feed pathname');
    }

    const publicKey = bs58.decode(url.pathname.slice(1));

    const feed = await this.vowLink.feedFromPublicKey(publicKey, {
      name: this.randomName(),
    });
    this.swarm.joinChannel(feed);
  }

  requestInvite() {
    const { requestId, request, decrypt } =
      this.identity.requestInvite(this.vowLink.id);

    const command = `/invite ${this.identity.name} ${bs58.encode(request)}`;

    let { promise, cancel } = this.swarm.waitForInvite(requestId,
      INVITE_TIMEOUT);

    promise = promise.then(async (invite) => {
      invite = decrypt(invite);

      const channel = await this.vowLink.channelFromInvite(
        invite,
        this.identity,
        { name: this.randomName() });

      this.swarm.joinChannel(channel);
    });

    return {
      command,

      // promise, cancel()
      promise,
      cancel,
    };
  }

  randomName() {
    return randomBytes(32).toString('hex');
  }
}
