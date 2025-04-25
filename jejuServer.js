require("dotenv").config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const dns = require('dns');
const { XMLParser } = require('fast-xml-parser');
const he = require('he');  // HTML 엔티티 디코딩

// 🌟 DNS 설정
dns.setServers(['1.1.1.1', '1.0.0.1', '8.8.8.8']);

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
    origin: [
        'http://localhost:3001',
        'https://yerin2da.github.io'
    ]
}));

// 🎯 jeju-culture 엔드포인트
app.get('/api/jeju-culture', async (req, res) => {
    dns.lookup('api.kcisa.kr', (err, address, family) => {
        console.log('KCISA IP 주소:', address);
    });

    try {
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
            responseType: 'text'  // XML로 받음
        });

        const parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: '',
            tagValueProcessor: (val) => he.decode(val)  // 1차 디코딩
        });

        const jsonData = parser.parse(response.data);

        // 💡 items 정제 (div, p 제거 + description 디코딩)
        let items = jsonData.response?.body?.items?.item || [];
        if (!Array.isArray(items)) items = [items];  // 배열 아닌 경우 배열화

        items = items.filter(item => item.title);  // title이 있는 것만 남김

        items = items.map(item => ({
            ...item,
            description: item.description ? he.decode(item.description) : ''  // 2차 디코딩
        }));

        // 🧹 다시 items에 덮어쓰기
        jsonData.response.body.items.item = items;

        res.json(jsonData);  // ✅ 깔끔한 JSON 반환

    } catch (error) {
        console.error('🔴 API 호출 실패:', error.message);
        res.status(500).json({ error: 'API 호출 실패' });
    }
});

// 🎯 jeju-festival 엔드포인트
app.get('/api/jeju-festival', async (req, res) => {
    try {
        const { page, locale, category, pageSize, cid } = req.query;
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

app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 서버 실행 중: http://localhost:${port}`);
});
