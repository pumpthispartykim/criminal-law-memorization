# 형사법 암기

형사재판실무와 검찰실무 학습 페이지를 한 곳에 모은 저장소입니다. 서버 없이 정적 파일로 동작합니다.

## 사용법
루트 `index.html`을 엽니다. 각 과목 제목 옆 **▾** 버튼을 눌러 다른 과목으로 전환합니다.

| 과목 | 내용 | 폴더 | 원본 |
|---|---|---|---|
| 형사재판실무 | 판례집·플래시 카드·OX 퀴즈·Drill | `trial/` | [criminal-trial-cases](https://github.com/pumpthispartykim/criminal-trial-cases) |
| 검찰실무 | 요론집·플래시 카드·OX 퀴즈 | `prosecution/` | [prosecution-practice](https://github.com/pumpthispartykim/prosecution-practice) |

- 주소 끝 `#trial` / `#prosecution`으로 원하는 과목을 바로 열 수 있습니다. 마지막으로 본 과목은 기억됩니다.
- 두 앱은 각각 iframe 안에서 동작합니다. 과목을 바꿔도 읽던 위치가 유지됩니다.
- 전환 메뉴는 `shared/switcher.js` 하나로 만들고, 두 앱의 `index.html` 끝에 이 스크립트를 한 줄씩 넣었습니다. 원본을 새로 복사한 뒤에도 그 한 줄만 다시 넣으면 됩니다.
- `trial/`이나 `prosecution/`을 따로 열고 메뉴를 쓰면 루트 페이지로 이동합니다.
- 두 앱이 함께 쓰는 파일은 `shared/`에 있습니다.
  - `switcher.js`: 제목 옆 ▾ 과목 전환
  - `reader.css`: 판례집·요론집 넓은 화면(좌우 여백 최소화)
  - `tocfold.js`: PC 목차 접기 버튼과 `\` 단축키

## 학습 기록
기록은 브라우저 `localStorage`에 저장됩니다. 형사실무는 `wk-*`, 검찰실무는 `gs-*` 키를 써서 서로 섞이지 않습니다.
주의: 원래 사이트(`.../criminal-trial-cases/`, `.../prosecution-practice/`)와 이 사이트는 주소가 달라서 기록이 공유되지 않습니다. 옮기려면 각 앱의 **백업·복원** 기능을 쓰세요.
