const axios = require('axios');
const fs = require('fs');
const path = require('path');

const baseUrl = 'http://api.kcisa.kr/openapi/CNV_060/request';
const serviceKey = '386f66a1-ae62-4ae9-9fe9-b5625d6263bc';
const dtypes = ['음악', '국악', '뮤지컬', '연극', '전시'];
const title = '제주';
const localeFilePath = path.join(__dirname, 'culture.json');

async function fetchCultureData() {
    let allItems = [];

    for (const dtype of dtypes) {
        const params = {
            serviceKey: serviceKey,
            numOfRows: 1000,
            pageNo: 1,
            dtype: dtype,
            title: title,
            type: 'json'
        };

        try {
            const { data } = await axios.get(baseUrl, { params });
            const items = data?.response?.body?.items?.item || [];

            console.log(`📂 ${dtype}: ${items.length}건 수집됨`);

            const enriched = items.map(item => ({
                ...item,
                dtype: dtype
            }));

            allItems.push(...enriched);
        } catch (error) {
            console.error(`❌ ${dtype} 요청 실패:`, error.message);
        }
    }

    fs.writeFileSync(localeFilePath, JSON.stringify(allItems, null, 2));
    console.log(`✅ 저장 완료: ${allItems.length}건이 culture.json에 저장되었습니다.`);
}

fetchCultureData();
