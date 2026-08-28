export const consoleStyles = `
  :host { all: initial; color-scheme: light dark; }
  * { box-sizing: border-box; }
  button, input, select { font: inherit; }
  .trigger { position: fixed; right: 20px; bottom: 20px; width: 48px; height: 48px; border: 0; border-radius: 14px; color: #fff; background: #6547f5; box-shadow: 0 10px 30px rgba(30, 20, 80, .28); cursor: pointer; font: 700 13px/1 system-ui, sans-serif; }
  .panel { position: fixed; right: 20px; bottom: 80px; width: min(560px, calc(100vw - 32px)); max-height: min(680px, calc(100vh - 110px)); display: flex; flex-direction: column; overflow: hidden; border: 1px solid rgba(127,127,140,.25); border-radius: 16px; background: #fff; color: #17171c; box-shadow: 0 24px 70px rgba(20, 18, 40, .28); font: 13px/1.45 system-ui, -apple-system, sans-serif; }
  .hidden { display: none; }
  header { display: flex; align-items: center; justify-content: space-between; padding: 16px 18px; border-bottom: 1px solid #ececf2; }
  h2 { margin: 0; font-size: 16px; }
  .subtitle { margin-top: 2px; color: #71717d; font-size: 12px; }
  .icon-button { border: 0; padding: 6px 8px; background: transparent; color: inherit; cursor: pointer; }
  .content { overflow: auto; padding: 14px 18px; }
  .empty { padding: 28px 12px; border: 1px dashed #d6d4df; border-radius: 10px; color: #777583; text-align: center; }
  .rule { display: grid; grid-template-columns: 24px minmax(100px,.7fr) minmax(190px,1.5fr) 28px; gap: 8px; align-items: center; margin-bottom: 9px; }
  .rule input[type="text"], .rule select { min-width: 0; width: 100%; height: 36px; padding: 0 10px; border: 1px solid #d9d7e2; border-radius: 8px; background: #fff; color: #17171c; outline: none; }
  .rule input[type="text"]:focus, .rule select:focus { border-color: #6547f5; box-shadow: 0 0 0 2px rgba(101,71,245,.12); }
  .remove { border: 0; background: transparent; color: #a33; cursor: pointer; font-size: 18px; }
  .toolbar, footer { display: flex; align-items: center; gap: 8px; }
  .toolbar { margin-top: 12px; }
  footer { justify-content: space-between; padding: 12px 18px 16px; border-top: 1px solid #ececf2; }
  .message { min-height: 18px; color: #71717d; }
  .message.error { color: #c0392b; }
  .message.success { color: #218a55; }
  .button { height: 34px; padding: 0 13px; border: 1px solid #d9d7e2; border-radius: 8px; background: #fff; color: #292832; cursor: pointer; }
  .button.primary { border-color: #6547f5; background: #6547f5; color: #fff; }
  .button.danger { color: #aa3030; }
  @media (prefers-color-scheme: dark) {
    .panel { border-color: #3a3945; background: #202027; color: #f2f1f6; }
    header, footer { border-color: #35343f; }
    .rule input[type="text"], .rule select, .button { border-color: #44434f; background: #292931; color: #f2f1f6; }
    .empty { border-color: #494754; }
  }
`;
