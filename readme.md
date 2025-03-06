# 作業方法

bun workspace を使っています。

1. ターミナルを開き、以下のコマンドを実行します。
   ※今はこの readme.md ファイルがあるディレクトリがカレントディレクトリです。
   ※bunのインストールを事前に行なってください。

```sh
bun install
```

1. ターミナルをもう一つ開きます。
   開いた２つのターミナルのうち最初に開いたものをターミナル１と呼ぶ事にします。今開いたものをターミナル２と呼ぶ事にします。vscode を使っている場合、ターミナルを２つ同時に表示するモードがおすすめです。

2. ターミナル 1 で以下のコマンドを実行してバックエンドを起動します
   ※ dockerのインストールを事前に行なってください。

```bash
cd packages/backend
bun run local-server
```

4. ターミナル 2 で以下のコマンドを実行してアプリを起動します。

```bash
cd packages/client

# web browserで開発
bun run web
# iOS simulatorで開発
bun run ios
# Android emulatorで開発
bun run android
```

5. APIの仕様は以下で確認できます。実際に実行もできまっせー

[http://localhost:3000/ui](http://localhost:3000/ui)

※バックエンドの起動必須

idTokenを設定して実行しないと、権限がないのでエラーが出ます。開発環境のidTokenは`eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJuYW1lIjoiWW9zaGlha2kgU3V5YW1hIiwicGljdHVyZSI6IiIsImVtYWlsIjoiYUBhLmFhIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImF1dGhfdGltZSI6MTczMzk4NjIzOCwidXNlcl9pZCI6InhkdW1QZzl2MFd3czZkYjhEOGd0ZEdVNmdlUGgiLCJmaXJlYmFzZSI6eyJpZGVudGl0aWVzIjp7ImVtYWlsIjpbImFAYS5hYSJdfSwic2lnbl9pbl9wcm92aWRlciI6InBhc3N3b3JkIn0sImlhdCI6MTczMzk4NjIzOCwiZXhwIjoxNzMzOTg5ODM4LCJhdWQiOiJ3aWNvbjIwMjQiLCJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vd2ljb24yMDI0Iiwic3ViIjoieGR1bVBnOXYwV3dzNmRiOEQ4Z3RkR1U2Z2VQaCJ9.`

# 最後に

bun add とかをやる時は、cd packages/client みたいな感じで client もしくは backend のフォルダに移動してからやってください。
# wicon2024-app-public
