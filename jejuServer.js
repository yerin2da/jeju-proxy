require("dotenv").config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const dns = require('dns');
const { XMLParser } = require('fast-xml-parser');  // XML 파서

// 🌟 Cloudflare Public DNS 설정!
dns.setServers(['1.1.1.1', '1.0.0.1', '8.8.8.8']);

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
    origin: [
        'http://localhost:3001',                    // 로컬 개발용
        'https://yerin2da.github.io'                // 배포용 (gh-pages)
    ]
}));

//문화 공공데이터 - 메인 전시, 뮤지컬, 연주회
app.get('/api/jeju-culture', async (req, res) => {
    dns.lookup('api.kcisa.kr', (err, address, family) => {
        console.log('KCISA IP 주소:', address);
    });
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
                'Accept': 'application/json',
                'Host': 'api.kcisa.kr'
            },
            responseType: 'text'  //  XML로 받을 준비
        });

        const parser = new XMLParser();  // 파서 생성
        const jsonData = parser.parse(response.data);  //  XML → JSON 변환

        res.json(jsonData);  // ✅ 변환된 JSON 반환
    } catch (error) {
        console.error('🔴 API 호출 실패:', error.message);
        res.status(500).json({ error: 'API 호출 실패' });
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
                'Accept': 'application/json',
                'Host': 'api.kcisa.kr'
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error('🔴 API 호출 실패:', error.message);
        res.status(500).json({ error: 'API 호출 실패' });
    }
});


app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 서버 실행 중: http://localhost:${port}`);
});
