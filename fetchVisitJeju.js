const axios = require('axios');
const fs = require('fs');

const baseUrl = 'http://api.visitjeju.net/vsjApi/contents/searchList';
const apiKey = 'a385f7dd89314985b6bce5245117e41b';
const locale = 'kr';
// const category = 'c1'; // 필요 시 c2~c5로 바꿀 수 있음

async function fetchVisitJeju() {
    let allItems = [];
    let page = 1;
    let maxPage = 1000; // 안전 기본값

    while (page <= maxPage) {
        const url = `${baseUrl}?apiKey=${apiKey}&locale=${locale}&page=${page}`;
        const { data } = await axios.get(url);

        if (data.items && data.items.length > 0) {
            if (page === 1) {
                maxPage = data.pageCount; // 첫 요청으로 실제 총 페이지 수 확인
                console.log(`📘 총 페이지 수: ${maxPage}`);
            }

            allItems.push(...data.items);
            console.log(`  - 페이지 ${page} → ${data.items.length}건`);
            page++;
        } else {
            console.log(`⚠️ 페이지 ${page}에 데이터 없음. 종료.`);
            break;
        }
    }

    fs.writeFileSync(`visitjeju.json`, JSON.stringify(allItems, null, 2));
    console.log(`✅ 저장 완료: 총 ${allItems.length}건이 visitjej.json에 저장되었습니다.`);
}

fetchVisitJeju();
