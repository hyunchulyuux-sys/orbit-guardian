# 🛰️ ORBIT GUARDIAN

**실제 궤도 데이터 기반 3D 위성 생존 관리 게임** — 포트폴리오.

저궤도(LEO)를 도는 **실제 우주 물체들**(Fengyun-1C·Cosmos-2251·Iridium-33 충돌 잔해 + 정거장/위성) 사이에서, 내가 쏘아올린 위성을 분사(Δv) 궤도 변경으로 충돌을 피하며 살려내는 게임.

## 특징
- **실제 궤도**: CelesTrak TLE를 **SGP4**로 실시간 전파(propagation). 위치가 진짜 물리대로 움직임.
- **라이브 데이터**: `/api/tle` 서버리스 함수가 CelesTrak에서 **최신 TLE를 서버측으로 받아옴**(브라우저 CORS 회피). CDN 6h 캐시 + fallback 스냅샷(`orbit-data.js`)으로 항상 최신·항상 동작.
- **3D**: Three.js. InstancedMesh 단일 드로우콜 + 4Hz throttled propagation으로 최적화.
- 위성 3종(기동/균형/내구), 궤도 유지·회피 기동, 실시간 충돌 위협 경고.

조작: `WASD` / 방향키 / 화면 버튼 (PRO 가속 · RETRO 감속 · RAISE/LOWER 고도).

## 구조
- `index.html` — 게임(Three.js·satellite.js CDN 로드)
- `api/tle.js` — Vercel 서버리스: 실시간 TLE 프록시(+캐시)
- `orbit-data.js` — 오프라인/실패 시 fallback 스냅샷
