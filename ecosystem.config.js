module.exports = {
    apps: [
        {
            name: "jejuServer",                // PM2 앱 이름 (고유)
            script: "jejuServer.js",                // 서버 파일 명
            cwd: "E:/cobra/jeju/jeju-proxy",         // jejuserver 실제 경로
            interpreter: "node",                // Node.js로 실행
            env: {
                NODE_ENV: "development",          // 필요 시 환경 변수 추가
                PORT: 5000                        // 서버 포트 (필요 시)
            }
        }
    ]
}