module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // 新機能
        'fix', // バグ修正
        'docs', // ドキュメントのみの変更
        'style', // フォーマット、セミコロンの追加など（コードの動作に影響しない変更）
        'refactor', // バグ修正や機能追加ではないコードの変更
        'perf', // パフォーマンス向上のための変更
        'test', // テストの追加や修正
        'chore', // ビルドプロセスやツール、ライブラリの変更
        'ci', // CI設定ファイルやスクリプトの変更
        'build', // ビルドシステムや外部依存関係に影響する変更
        'revert', // 以前のコミットを元に戻す
      ],
    ],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
    'scope-case': [2, 'always', 'lower-case'],
    'subject-case': [
      2,
      'never',
      ['sentence-case', 'start-case', 'pascal-case', 'upper-case'],
    ],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 72],
    'body-leading-blank': [1, 'always'],
    'body-max-line-length': [2, 'always', 100],
    'footer-leading-blank': [1, 'always'],
    'footer-max-line-length': [2, 'always', 100],
  },
}
