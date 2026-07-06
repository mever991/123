(function () {
    "use strict";

    // ----- Элементы DOM -----
    const taskInput = document.getElementById('taskInput');
    const addBtn = document.getElementById('addBtn');
    const taskList = document.getElementById('taskList');
    const taskCounter = document.getElementById('task-counter');
    const infoText = document.getElementById('info-text');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const clearCompletedBtn = document.getElementById('clearCompletedBtn');

    // ----- Состояние -----
    let tasks = [];
    let currentFilter = 'all'; // 'all', 'active', 'completed'

    // ----- Загрузка из LocalStorage -----
    function loadTasks() {
        const stored = localStorage.getItem('todoTasks');
        if (stored) {
            try {
                tasks = JSON.parse(stored);
                if (!Array.isArray(tasks)) tasks = [];
            } catch {
                tasks = [];
            }
        } else {
            // Начальные демо-данные
            tasks = [
                { id: Date.now() + 1, text: 'Изучить HTML, CSS, JS', completed: false },
                { id: Date.now() + 2, text: 'Сделать TodoList', completed: true },
            ];
        }
        tasks = tasks.filter(t => t && typeof t === 'object' && t.text !== undefined);
        tasks.forEach(t => { if (!t.id) t.id = Date.now() + Math.random(); });
    }

    // ----- Сохранение в LocalStorage -----
    function saveTasks() {
        localStorage.setItem('todoTasks', JSON.stringify(tasks));
    }

    // ----- Рендеринг списка -----
    function render() {
        // Фильтрация
        let filtered = tasks;
        if (currentFilter === 'active') {
            filtered = tasks.filter(t => !t.completed);
        } else if (currentFilter === 'completed') {
            filtered = tasks.filter(t => t.completed);
        }

        taskList.innerHTML = '';

        if (filtered.length === 0) {
            const empty = document.createElement('li');
            empty.className = 'empty-message';
            empty.textContent = currentFilter === 'all' ? '✨ Нет задач. Добавьте первую!' :
                currentFilter === 'active' ? '✅ Все задачи выполнены!' :
                    '📭 Нет завершённых задач.';
            taskList.appendChild(empty);
        } else {
            // Сортировка: сначала невыполненные
            const sorted = [...filtered].sort((a, b) => {
                if (a.completed === b.completed) return 0;
                return a.completed ? 1 : -1;
            });

            for (const task of sorted) {
                const li = document.createElement('li');
                li.className = 'task-item' + (task.completed ? ' completed' : '');
                li.dataset.id = task.id;

                // Чекбокс
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.className = 'task-check';
                checkbox.checked = task.completed;
                checkbox.addEventListener('change', function (e) {
                    e.stopPropagation();
                    toggleTask(task.id);
                });

                // Текст задачи
                const span = document.createElement('span');
                span.className = 'task-text';
                span.textContent = task.text;

                // Кнопка удаления
                const delBtn = document.createElement('button');
                delBtn.className = 'delete-btn';
                delBtn.innerHTML = '✕';
                delBtn.setAttribute('aria-label', 'Удалить задачу');
                delBtn.addEventListener('click', function (e) {
                    e.stopPropagation();
                    deleteTask(task.id);
                });

                li.appendChild(checkbox);
                li.appendChild(span);
                li.appendChild(delBtn);
                taskList.appendChild(li);
            }
        }

        // Обновление счётчиков
        const total = tasks.length;
        const completedCount = tasks.filter(t => t.completed).length;
        const activeCount = total - completedCount;
        taskCounter.textContent = total;

        let infoMsg = `Всего: ${total}`;
        if (total > 0) {
            infoMsg += `  •  Активных: ${activeCount}  •  Завершённых: ${completedCount}`;
        }
        infoText.textContent = infoMsg;

        // Активное состояние фильтров
        filterBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === currentFilter);
        });

        saveTasks();
    }

    // ----- Добавление задачи -----
    function addTask() {
        const text = taskInput.value.trim();
        if (text === '') {
            taskInput.focus();
            return;
        }

        const newTask = {
            id: Date.now() + Math.random() * 1000,
            text: text,
            completed: false,
        };
        tasks.push(newTask);
        taskInput.value = '';
        taskInput.focus();
        render();
    }

    // ----- Переключение статуса -----
    function toggleTask(id) {
        const task = tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            render();
        }
    }

    // ----- Удаление задачи -----
    function deleteTask(id) {
        tasks = tasks.filter(t => t.id !== id);
        render();
    }

    // ----- Очистка завершённых -----
    function clearCompleted() {
        const hasCompleted = tasks.some(t => t.completed);
        if (!hasCompleted) return;
        if (confirm('Удалить все завершённые задачи?')) {
            tasks = tasks.filter(t => !t.completed);
            render();
        }
    }

    // ----- Установка фильтра -----
    function setFilter(filter) {
        if (filter === currentFilter) return;
        currentFilter = filter;
        render();
    }

    // ----- Обработчики событий -----
    addBtn.addEventListener('click', addTask);

    taskInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTask();
        }
    });

    filterBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            setFilter(this.dataset.filter);
        });
    });

    clearCompletedBtn.addEventListener('click', clearCompleted);

    // ----- Инициализация -----
    loadTasks();
    render();
    taskInput.focus();

    // Автофокус при клике на контейнер
    document.querySelector('.todo-container').addEventListener('click', function (e) {
        if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'BUTTON') {
            taskInput.focus();
        }
    });

})();