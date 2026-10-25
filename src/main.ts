import './style.css';

const app = document.querySelector('#app');
if (!app) {
  throw new Error('#app root is missing');
}

app.innerHTML = `
  <main class="placeholder">
    <h1>Linebreak</h1>
    <p>A browser falling-block puzzle. Phase 0 placeholder.</p>
  </main>
`;
