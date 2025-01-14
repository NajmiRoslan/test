import { useState } from "react"
import '../index.css'

const CategoryManager = ({ onAddCategory, onDeleteCategory }) => {
    const [newCategory, setNewCategory] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();

        if (newCategory.trim()) {
            onAddCategory(newCategory.trim());
            setNewCategory("")
        }
    };

    return (
        <div className="category-manager">
            <h2>Manage Categories</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="New category name"
                />
                <button type="submit">Add Category</button>
            </form>
            <ul>
                {categories.map((category) => (
                    <li key={category}>
                        {category}
                        <button onClick={() => onDeleteCategory(category)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    )
};

export default CategoryManager;