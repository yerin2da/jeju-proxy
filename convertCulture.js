const fs = require('fs');
const xml2js = require('xml2js');

// XML 파서 설정
const parser = new xml2js.Parser({ explicitArray: false });

// culture.xml 파일 읽기
fs.readFile('culture.xml', 'utf8', (err, xmlData) => {
    if (err) {
        console.error('❌ culture.xml 파일을 읽을 수 없습니다:', err);
        return;
    }

    // 파싱 시작
    parser.parseString(xmlData, (err, result) => {
        if (err) {
            console.error('❌ XML 파싱 에러:', err);
            return;
        }

        const items = result.response.body.items.item;
        fs.writeFileSync('culture.json', JSON.stringify(items, null, 2));
        console.log(`✅ 변환 완료: 총 ${items.length}건이 culture.json에 저장되었습니다.`);
    });
});
