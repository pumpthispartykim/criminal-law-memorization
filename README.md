# 형사법 암기

형사실무 판례와 검찰실무 학습 페이지를 한 곳에 모은 저장소입니다. 서버 없이 정적 파일로 동작합니다.

## 사용법
루트 `index.html`을 엽니다. 맨 위 버튼으로 두 과목을 전환합니다.

| 버튼 | 내용 | 폴더 | 원본 |
|---|---|---|---|
| 형사실무 판례 | 판례집·플래시 카드·OX 퀴즈·Drill | `trial/` | [criminal-trial-cases](https://github.com/pumpthispartykim/criminal-trial-cases) |
| 검찰실무 | 요론집·플래시 카드·OX 퀴즈 | `prosecution/` | [prosecution-practice](https://github.com/pumpthispartykim/prosecution-practice) |

- 주소 끝 `#trial` / `#prosecution`으로 원하는 과목을 바로 열 수 있습니다. 마지막으로 본 과목은 기억됩니다.
- 두 앱은 각각 iframe 안에서 원본 그대로 동작합니다. 과목을 바꿔도 읽던 위치가 유지됩니다.

## 학습 기록
기록은 브라우저 `localStorage`에 저장됩니다. 형사실무는 `wk-*`, 검찰실무는 `gs-*` 키를 써서 서로 섞이지 않습니다.
주의: 원래 사이트(`.../criminal-trial-cases/`, `.../prosecution-practice/`)와 이 사이트는 주소가 달라서 기록이 공유되지 않습니다. 옮기려면 각 앱의 **백업·복원** 기능을 쓰세요.
