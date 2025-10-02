const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const navMenu = document.querySelector('.nav-menu');

mobileMenuToggle?.addEventListener('click', () => {
    navMenu.classList.toggle('active');
});

document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
    });
});

const todoForm = document.querySelector('form');
const todoInput = document.getElementById('todo-input');
const todoListUL = document.getElementById('todo-list');
const emptyState = document.getElementById('empty-state');

const progressBar = document.getElementById('progress-bar');
const completedCount = document.getElementById('completed-count');
const totalCount = document.getElementById('total-count');
const completionPercentage = document.getElementById('completion-percentage');
const pendingCount = document.getElementById('pending-count');
const completedOnlyCount = document.getElementById('completed-only-count');

const filterButtons = document.querySelectorAll('.filter-btn');
let currentFilter = 'all';

let allTodos = getTodos();
updateTodoList();
updateProgress();

todoForm.addEventListener('submit', function(e){
    e.preventDefault();
    addTodo();
});

function addTodo(){
    const todoText = todoInput.value.trim();
    if(todoText.length > 0){
        const todoObject = {
            text: todoText,
            completed: false,
            id: Date.now()
        }
        allTodos.push(todoObject);
        updateTodoList();
        updateProgress();
        saveTodos();
        todoInput.value = "";
        
        todoInput.style.borderColor = 'var(--success-color)';
        setTimeout(() => {
            todoInput.style.borderColor = '';
        }, 300);
    }  
}

function updateTodoList(){
    todoListUL.innerHTML = "";
    
    const filteredTodos = allTodos.filter(todo => {
        if (currentFilter === 'all') return true;
        if (currentFilter === 'pending') return !todo.completed;
        if (currentFilter === 'completed') return todo.completed;
    });
    
    if (filteredTodos.length === 0) {
        emptyState.classList.add('show');
    } else {
        emptyState.classList.remove('show');
    }
    
    filteredTodos.forEach((todo, index) => {
        const todoIndex = allTodos.findIndex(t => t.id === todo.id);
        const todoItem = createTodoItem(todo, todoIndex);
        todoListUL.append(todoItem);
    });
}

function createTodoItem(todo, todoIndex){
    const todoId = "todo-" + todo.id;
    const todoLI = document.createElement("li");
    const todoText = todo.text;
    todoLI.className = "todo";
    todoLI.innerHTML = `
        <input type="checkbox" id="${todoId}">
        <label class="custom-checkbox" for="${todoId}">
            <svg fill="transparent" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/></svg>
        </label>
        <label for="${todoId}" class="todo-text">
            ${todoText}
        </label>
        <input type="text" class="edit-input" value="${todoText}">
        <div class="todo-actions">
            <button class="edit-button" title="Edit task">
                <svg fill="var(--secondary-color)" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/></svg>
            </button>
            <button class="delete-button" title="Delete task">
                <svg fill="var(--secondary-color)" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg>
            </button>
            <button class="save-button" title="Save changes">Save</button>
            <button class="cancel-button" title="Cancel">Cancel</button>
        </div>
    `;
    
    const checkbox = todoLI.querySelector("input[type='checkbox']");
    const deleteButton = todoLI.querySelector(".delete-button");
    const editButton = todoLI.querySelector(".edit-button");
    const editInput = todoLI.querySelector(".edit-input");
    const saveButton = todoLI.querySelector(".save-button");
    const cancelButton = todoLI.querySelector(".cancel-button");
    
    checkbox.addEventListener("change", () => {
        allTodos[todoIndex].completed = checkbox.checked;
        saveTodos();
        updateProgress();
    });
    checkbox.checked = todo.completed;
    
    deleteButton.addEventListener("click", () => {
        deleteTodoItem(todoIndex);
    });
    
    editButton.addEventListener("click", () => {
        todoLI.classList.add('editing');
        editInput.focus();
        editInput.select();
    });
    
    saveButton.addEventListener("click", () => {
        const newText = editInput.value.trim();
        if (newText.length > 0) {
            allTodos[todoIndex].text = newText;
            saveTodos();
            updateTodoList();
            updateProgress();
        }
    });
    
    cancelButton.addEventListener("click", () => {
        todoLI.classList.remove('editing');
        editInput.value = todo.text;
    });
    
    editInput.addEventListener("keypress", (e) => {
        if (e.key === 'Enter') {
            saveButton.click();
        }
    });
    
    editInput.addEventListener("keydown", (e) => {
        if (e.key === 'Escape') {
            cancelButton.click();
        }
    });
    
    return todoLI;
}

function deleteTodoItem(todoIndex){
    allTodos = allTodos.filter((_, i) => i !== todoIndex);
    saveTodos();
    updateTodoList();
    updateProgress();
}

function updateProgress() {
    const total = allTodos.length;
    const completed = allTodos.filter(todo => todo.completed).length;
    const pending = total - completed;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    progressBar.style.width = percentage + '%';
    
    completedCount.textContent = completed;
    totalCount.textContent = total;
    completionPercentage.textContent = percentage + '%';
    pendingCount.textContent = pending;
    completedOnlyCount.textContent = completed;
}

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        currentFilter = button.dataset.filter;
        
        updateTodoList();
    });
});

function saveTodos(){
    const todosJson = JSON.stringify(allTodos);
    localStorage.setItem("todos", todosJson);
}

function getTodos(){
    const todos = localStorage.getItem("todos") || "[]";
    return JSON.parse(todos);
}