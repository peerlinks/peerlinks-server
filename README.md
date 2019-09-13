# vowlink-server

Seeding server for [VowLink] protocol.

## Usage

```sh
git clone git://github.com/vowlink/vowlink-server
cd vowlink-server
npm i
cp -rf example-config.json config.json
vim config.json # change passphrase, httpToken and other defaults
npm start
```

## REST

Following APIs are available on `config.port` / `config.host`.
`Authorization: bearer <config.httpToken>` header must be set for all
requests except `/`.

### GET `/`

Return current version of the server.

Response:
```json
{ "version": "1.0.0" }
```

### PUT `/new-feed`

Subscribe to a feed using feed URL.

Request:
```json
{
  "feedURL": "vowlink://feed/..."
}
```

Response:
```json
{
  "ok": true
}
```

### PUT `/request-invite`

Generate invite request code.

Request:
```json
{}
```

Response:
```json
{
  "ok": true,
  "command": "/invite <config.identity> ..."
}
```

## LICENSE

This software is licensed under the MIT License.

Copyright Fedor Indutny, 2019.

Permission is hereby granted, free of charge, to any person obtaining a
copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to permit
persons to whom the Software is furnished to do so, subject to the
following conditions:

The above copyright notice and this permission notice shall be included
in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
USE OR OTHER DEALINGS IN THE SOFTWARE.

[VowLink]: https://github.com/vowlink/vowlink
