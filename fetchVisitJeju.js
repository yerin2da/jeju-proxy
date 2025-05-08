const axios = require('axios');
const fs = require('fs');

const baseUrl = 'http://api.visitjeju.net/vsjApi/contents/searchList';
const apiKey = 'a385f7dd89314985b6bce5245117e41b';
const locale = 'kr';

const validCategories = ['c1', 'c2', 'c3', 'c4', 'c5'];

async function fetchVisitJeju() {
    let allItems = [];
    let page = 1;
    let maxPage = 1000; // 초기 기본값

    while (page <= maxPage) {
        const url = `${baseUrl}?apiKey=${apiKey}&locale=${locale}&page=${page}`;
        const { data } = await axios.get(url);

        if (data.items && data.items.length > 0) {
            if (page === 1) {
                maxPage = data.pageCount;
                console.log(`📘 총 페이지 수: ${maxPage}`);
            }

            // c1~c5만 필터링
            const filtered = data.items.filter(
                item => validCategories.includes(item.contentscd?.value)
            );

            allItems.push(...filtered);
            console.log(`  - 페이지 ${page} → ${filtered.length}건 (필터 후)`);

            page++;
        } else {
            console.log(` 페이지 ${page}에 데이터 없음. 종료.`);
            break;
        }
    }

    fs.writeFileSync(`visitjeju.json`, JSON.stringify(allItems, null, 2));
    console.log(`✅ 저장 완료: 총 ${allItems.length}건이 visitjeju.json에 저장되었습니다.`);
}

fetchVisitJeju();
