import { AppComponent } from './App';
import { App } from '@capacitor/app';
import './index.css';

App.addListener('appUrlOpen', event => {
  const url = new URL(event.url);
  history.replaceState(null, '', event.url.slice(url.origin.length));
});

function mount() {
  const APP = AppComponent.create();

  document.body.appendChild(APP);
}

window.addEventListener('DOMContentLoaded', mount);
