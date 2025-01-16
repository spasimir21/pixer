import { AppComponent } from './App';

function mount() {
  const APP = AppComponent.create();

  const root = document.querySelector('#root')!;

  root.appendChild(APP);
}

window.addEventListener('DOMContentLoaded', mount);
