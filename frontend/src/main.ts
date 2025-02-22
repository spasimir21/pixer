import { AppComponent } from './App';
import './index.css';

function mount() {
  const APP = AppComponent.create();

  document.body.appendChild(APP);
}

window.addEventListener('DOMContentLoaded', mount);
