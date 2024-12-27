import { cleanup, StateNode, ValueNode } from '@lib/reactivity';
import { html, UINode } from '@lib/ui';
import {
  Component,
  createContextValue,
  useCleanup,
  useChildComponents,
  useComputed,
  useInterval,
  useState
} from '@lib/component';
import './index.css';

interface Todo {
  task: string;
  done: boolean;
}

const [useCount, useProvideCount] = createContextValue<number>('Count');

const TodoComponent = Component(({ todo, remove }: { todo: Todo; remove: () => void }): UINode => {
  const count = useCount();

  useCleanup(() => console.log(todo.task));

  return html`
    <div class="flex flex-row gap-2">
      <p @click=${remove} .line-through=${todo.done}>${$count}: ${todo.task}</p>
      <input type="checkbox" :checked=${todo.done} />
    </div>
  `;
});

const AppComponent = Component((): UINode => {
  const [Todo] = useChildComponents(TodoComponent);

  const todos = useState<Todo[]>([]);
  const task = useState('');

  const todosLeft = useComputed(() => $todos.reduce((count, todo) => (todo.done ? count : count + 1), 0));

  const addTodo = () => {
    $todos.push({ task: $task, done: false });
    $task = '';
  };

  const count = useProvideCount(0);

  useInterval(() => $count++, 1000);

  return html`
    <p>${$todos.length} total todos. ${$todosLeft} todos left.</p>

    <if ${$todos.length > 0}>
      <each ${$todos}
        >${(todo: Todo, index: ValueNode<number>) =>
          Todo({
            todo,
            remove: () => $todos.splice($index, 1)
          })}</each
      >
    </if>
    <else>
      <p>No todos left.</p>
    </else>

    <input type="text" :value=${$task} />
    <button @click=${addTodo}>Add</button>
    <button @click=${() => ($todos = $todos.filter(todo => !todo.done))}>Clear Done</button>
    <button @click=${() => ($todos = [])}>Clear All</button>
    <button @click=${() => $todos.sort(() => Math.random() - 0.5)}>Shuffle</button>
  `;
});

function mount() {
  const APP = AppComponent.create();

  const root = document.querySelector('#root')!;
  root.appendChild(APP);

  // setTimeout(() => cleanup(APP), 5000);
}

window.addEventListener('DOMContentLoaded', mount);
