require("dotenv").config();
const express = require('express');
const axios = require('axios');
const axiosRetry = require('axios-retry').default;
const cors = require('cors');
const helmet = require('helmet');
const dns = require('dns');
const fs = require('fs');
const path = require('path');

dns.setServers(['1.1.1.1', '1.0.0.1', '8.8.8.8', '8.8.4.4']);
axiosRetry(axios, { retries: 3, retryDelay: axiosRetry.exponentialDelay });

const app = express();
const port = 8080;

// ✅ 미들웨어 순서 중요
app.use(express.json());

app.use(cors({
    origin: [
        'http://localhost:3000',
        'https://yerin2da.github.io'
    ]
}));

app.use(helmet());
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "https:", "https://fonts.googleapis.com", "https://*.gstatic.com", "'unsafe-inline'"],
            fontSrc: ["'self'", "https:", "data:"],
            imgSrc: ["'self'", "https:", "data:"],
            scriptSrc: ["'self'", "https:", "'unsafe-inline'"]
        }
    })
);

// 📦 문화 공공데이터
app.get('/api/jeju-culture', async (req, res) => {
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
            headers: { 'Accept': 'application/json' }
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

// 📦 비짓제주 축제
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
            headers: { 'Accept': 'application/json' }
        });
        res.json(response.data);
    } catch (error) {
        console.error('🔴 API 호출 실패:', error.message);
        res.status(500).json({ error: 'API 호출 실패' });
    }
});

// 💬 댓글 관련
const dbFilePath = path.join(__dirname, 'db.json');
let db = { comments: [] };

try {
    const data = fs.readFileSync(dbFilePath, 'utf8');
    db = JSON.parse(data);
} catch (error) {
    console.error('db.json 읽기 실패:', error.message);
}

// 댓글 조회
app.get('/api/comments', (req, res) => {
    console.log("💬 댓글 요청 들어옴:", req.query);
    const { postId } = req.query;
    const filtered = db.comments.filter(c => c.postId === postId);
    res.json(filtered);
});

// 댓글 등록
app.post('/api/comments', (req, res) => {
    const newComment = {
        id: Math.random().toString(36).substr(2, 4),
        title: req.body.title,
        postId: req.body.postId
    };
    db.comments.push(newComment);
    saveDb();
    res.json(newComment);
});

// 댓글 수정
app.put('/api/comments/:id', (req, res) => {
    const { id } = req.params;
    const idx = db.comments.findIndex(c => c.id === id);
    if (idx !== -1) {
        db.comments[idx] = { ...db.comments[idx], ...req.body };
        saveDb();
        res.json(db.comments[idx]);
    } else {
        res.status(404).json({ error: 'Comment not found' });
    }
});

// 댓글 삭제
app.delete('/api/comments/:id', (req, res) => {
    const { id } = req.params;
    const idx = db.comments.findIndex(c => c.id === id);
    if (idx !== -1) {
        db.comments.splice(idx, 1);
        saveDb();
        res.status(204).send();
    } else {
        res.status(404).json({ error: 'Comment not found' });
    }
});

// JSON 저장 함수
function saveDb() {
    fs.writeFileSync(dbFilePath, JSON.stringify(db, null, 2));
}

// 서버 실행
app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 서버 실행 중: http://0.0.0.0:${port}`);
});
