
require("dotenv").config();
const express = require('express');
const axios = require('axios');
const axiosRetry = require('axios-retry').default;

axiosRetry(axios, { retries: 3, retryDelay: axiosRetry.exponentialDelay });
const cors = require('cors');

const dns = require('dns');

// 🌟 Cloudflare Public DNS 설정!
// Cloudflare + Google DNS 모두 추가!
dns.setServers(['1.1.1.1', '1.0.0.1', '8.8.8.8', '8.8.4.4']);


const app = express();
const port = process.env.PORT || 8000;

app.use(cors({
    origin: [
        'http://localhost:3000',                    // 로컬 개발용
        'https://yerin2da.github.io'                // 배포용 (gh-pages)
    ]
}));
const helmet = require('helmet');

// helmet 기본 보안 설정
app.use(helmet());

// CSP 설정 (스타일시트, 폰트, 이미지 등 허용)
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "https:", "https://fonts.googleapis.com", "https://*.gstatic.com", "'unsafe-inline'"], // 외부 스타일시트 허용
            fontSrc: ["'self'", "https:", "data:"],            // 폰트
            imgSrc: ["'self'", "https:", "data:"],             // 이미지
            scriptSrc: ["'self'", "https:", "'unsafe-inline'"], // 스크립트
        },
    })
);

//문화 공공데이터 - 메인 전시, 뮤지컬, 연주회
app.get('/api/jeju-culture', async (req, res) => {
    try {
        // 프론트에서 넘긴 모든 쿼리 파라미터 받기
        const { pageNo, numOfRows, dtype, title } = req.query;

        console.log("🔍 받은 pageNo:", pageNo);

        const response = await axios.get('http://api.kcisa.kr/openapi/CNV_060/request', {
            params: {
                serviceKey: "386f66a1-ae62-4ae9-9fe9-b5625d6263bc",
                pageNo,
                numOfRows,
                dtype,
                title,
                type: 'json'
            },
            headers: {
                'Accept': 'application/json'
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error('🔴 API 호출 실패:', error.message);
        if (error.response) {
            console.error('🔴 상태 코드:', error.response.status);
        }
        res.status(500).json({ error: 'API 호출 실패', details: error.message });
    }

});

// 비짓제주 - 메인 축제/행사
app.get('/api/jeju-festival', async (req, res) => {
    try {
        // 프론트에서 넘긴 모든 쿼리 파라미터 받기
        const { page, locale, category, pageSize, cid} = req.query;

        console.log("🔍 받은 pageNo:", page);

        const response = await axios.get('http://api.visitjeju.net/vsjApi/contents/searchList', {
            params: {
                apiKey: "a385f7dd89314985b6bce5245117e41b",
                page,
                locale,
                category,
                pageSize,
                cid
            },
            headers: {
                'Accept': 'application/json'
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error('🔴 API 호출 실패:', error.message);
        res.status(500).json({ error: 'API 호출 실패' });
    }
});

// 여행가이드 댓글
app.get('/posts', (req, res) => {
    const postId = req.query.postId;
    res.json([
        { id: 1, body: '댓글입니다.', postId },
        // 실제 데이터 반환
    ]);
});


app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 서버 실행 중: http://localhost:${port}`);
});
