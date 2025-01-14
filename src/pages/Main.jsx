import { useState, useEffect, useRef } from "react";
import { db } from "../utils/firebase";
import { ref, onValue, set, push, update, remove } from "firebase/database";
import { AiOutlineSearch, AiOutlineDelete, AiOutlineEdit, AiOutlinePlus, AiOutlineClose, AiOutlineSave, AiOutlineArrowLeft } from "react-icons/ai";
import '../index.css';
import CategoryManager from "../components/CategoryManager";

export default function Main() {
    const [suppliers, setSuppliers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedSupplier, setSelectedSupplier] = useState("");
    const [newSupplier, setNewSupplier] = useState({
        name: "",
        origin: "",
        category: "",
        desc: "",
        products: [],
    });
    const [editSupplierId, setEditSupplierId] = useState(null);
    const [newProduct, setNewProduct] = useState({ name: "", price: "" });
    const [error, setError] = useState("");
    const [editingProduct, setEditingProduct] = useState(null);
    const [categories, setCategories] = useState([
        "Supplier",
        "Logistic",
        "Electrical & Instrument",
        "Mechanical",
    ]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [showEditingSection, setShowEditingSection] = useState(false);
    const supplierFormRef = useRef(null);

    const fetchSuppliers = () => {
        const suppliersRef = ref(db, 'suppliers');
        onValue(suppliersRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setSuppliers(
                    Object.entries(data).map(([id, value]) => ({ id, ...value }))
                )
            } else {
                setSuppliers([])
            }
        });
    };

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const checkDuplicateSupplier = (name, currentId = null) => {
        return suppliers.some(
            (supplier) =>
                supplier.name.toLowerCase() === name.toLowerCase() &&
                supplier.id !== currentId
        );
    };

    const handleSaveSupplier = () => {
        if (!newSupplier.name.trim()) {
            setError("Supplier name cannot be empty");
            return;
        }

        const isDuplicate = checkDuplicateSupplier(
            newSupplier.name,
            editSupplierId
        );

        if (isDuplicate) {
            setError(`Supplier "${newSupplier.name}" already exists`);
            return;
        }

        setError("");

        if (editSupplierId) {
            update(ref(db, `suppliers/${editSupplierId}`), newSupplier);
        } else {
            const newRef = push(ref(db, "suppliers"));
            set(newRef, newSupplier);
        }

        setNewSupplier({
            name: "",
            origin: "",
            category: "",
            desc: "",
            products: [],
        });
        setEditSupplierId(null);
        setShowEditingSection(false);
    };

    const handleDeleteSupplier = (id) => {
        remove(ref(db, `suppliers/${id}`));
    };

    const handleEditSupplier = (supplier) => {
        setNewSupplier(supplier);
        setEditSupplierId(supplier.id);
        setError("");
        setShowEditingSection(true);
        scrollToSupplierForm();
    };

    const handleAddProduct = (id, product) => {
        const supplier = suppliers.find((sup) => sup.id === id);
        if (!supplier || !product.name || !product.price) return;

        const updatedProducts = [...(supplier.products || []), product];
        update(ref(db, `suppliers/${id}`), { products: updatedProducts });
        setNewProduct({ name: "", price: "" });
    };

    const handleRemoveProduct = (id, productIndex) => {
        const supplier = suppliers.find((sup) => sup.id === id);
        if (!supplier) return;

        const updatedProducts = supplier.products.filter(
            (_, index) => index !== productIndex
        );
        update(ref(db, `suppliers/${id}`), { products: updatedProducts });
    };

    const handleEditProduct = (supplierId, productIndex) => {
        setEditingProduct({ supplierId, productIndex });
    };

    const handleSaveEditedProduct = (
        supplierId,
        productIndex,
        updatedProduct
    ) => {
        const supplier = suppliers.find((sup) => sup.id === supplierId);
        if (!supplier) return;

        const updatedProducts = supplier.products.map((product, index) =>
            index === productIndex ? updatedProduct : product
        );
        update(ref(db, `suppliers/${supplierId}`), { products: updatedProducts });
        setEditingProduct(null);
    };

    const scrollToSupplierForm = () => {
        supplierFormRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleAddCategory = (newCategory) => {
        if (!categories.includes(newCategory)) {
            setCategories([...categories, newCategory]);
        }
    };

    const handleDeleteCategory = (categoryToDelete) => {
        setCategories(
            categories.filter((category) => category !== categoryToDelete)
        );
    };

    const handleSearch = () => {
        // The actual filtering is done in the .filter() method below
    };

    const handleCategoryChange = (supplierId, newCategory) => {
        update(ref(db, `suppliers/${supplierId}`), { category: newCategory });
    };

    return (
        <div className="container">
            <h1>Hi Technics Supplier Database</h1>
            <button
                className="toggle-edit-button"
                onClick={() => setShowEditingSection(!showEditingSection)}
            >
                {showEditingSection
                    ? "Back to Suppliers"
                    : "Add/Edit Suppliers and Categories"}
            </button>

            {showEditingSection ? (
                <div className="editing-section">
                    <button
                        className="go-back-button"
                        onClick={() => setShowEditingSection(false)}
                    >
                        <AiOutlineArrowLeft /> Go Back to Supplier List
                    </button>
                    <h2>Add/Edit Suppliers and Categories</h2>
                    <div className="supplier-form" ref={supplierFormRef}>
                        <h2>{editSupplierId ? "Edit" : "Add"} Supplier</h2>
                        {error && <div className="error-message">{error}</div>}
                        <input
                            type="text"
                            placeholder="Supplier Name"
                            value={newSupplier.name}
                            onChange={(e) => {
                                setNewSupplier({ ...newSupplier, name: e.target.value });
                                setError("");
                            }}
                        />
                        <input
                            type="text"
                            placeholder="Origin"
                            value={newSupplier.origin}
                            onChange={(e) =>
                                setNewSupplier({ ...newSupplier, origin: e.target.value })
                            }
                        />
                        <select
                            value={newSupplier.category}
                            onChange={(e) =>
                                setNewSupplier({ ...newSupplier, category: e.target.value })
                            }
                        >
                            <option value="">Select a category</option>
                            {categories.map((category) => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>
                        <input
                            type="text"
                            placeholder="Description"
                            value={newSupplier.desc}
                            onChange={(e) =>
                                setNewSupplier({ ...newSupplier, desc: e.target.value })
                            }
                        />
                        <button onClick={handleSaveSupplier}>
                            {editSupplierId ? "Update" : "Add"} Supplier
                        </button>
                    </div>
                    <CategoryManager
                        categories={categories}
                        onAddCategory={handleAddCategory}
                        onDeleteCategory={handleDeleteCategory}
                    />
                </div>
            ) : (
                <>
                    {/* <button
                className="go-back-button"
                onClick={() => setShowEditingSection(true)}
              >
                <AiOutlineArrowLeft /> Go Back
              </button> */}
                    <div className="search-bar">
                        <input
                            type="text"
                            placeholder="Search suppliers..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <select
                            value={selectedSupplier}
                            onChange={(e) => setSelectedSupplier(e.target.value)}
                        >
                            <option value="">Select a supplier</option>
                            {suppliers.map((supplier) => (
                                <option key={supplier.id} value={supplier.name}>
                                    {supplier.name}
                                </option>
                            ))}
                        </select>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                            <option value="">All Categories</option>
                            {categories.map((category) => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>
                        <button onClick={handleSearch} className="search-button">
                            <AiOutlineSearch />
                        </button>
                    </div>

                    <div className="supplier-list">
                        {suppliers
                            .filter(
                                (sup) =>
                                    (searchTerm === "" ||
                                        sup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        sup.category
                                            .toLowerCase()
                                            .includes(searchTerm.toLowerCase())) &&
                                    (selectedSupplier === "" || sup.name === selectedSupplier) &&
                                    (selectedCategory === "" || sup.category === selectedCategory)
                            )
                            .map((supplier) => (
                                <div key={supplier.id} className="supplier-card">
                                    <h3>{supplier.name}</h3>
                                    <p>Origin: {supplier.origin}</p>
                                    <div className="category-select">
                                        <label htmlFor={`category-${supplier.id}`}>Category:</label>
                                        <select
                                            id={`category-${supplier.id}`}
                                            value={supplier.category}
                                            onChange={(e) =>
                                                handleCategoryChange(supplier.id, e.target.value)
                                            }
                                        >
                                            {categories.map((category) => (
                                                <option key={category} value={category}>
                                                    {category}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <p>{supplier.desc}</p>

                                    <div className="product-table-container">
                                        <h4>Products</h4>
                                        <table className="product-table">
                                            <thead>
                                                <tr>
                                                    <th>Product Name</th>
                                                    <th>Price per Unit (RM)</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {(supplier.products || []).map((product, index) => (
                                                    <tr key={index} className="product-row">
                                                        <td>
                                                            {editingProduct?.supplierId === supplier.id &&
                                                                editingProduct?.productIndex === index ? (
                                                                <input
                                                                    type="text"
                                                                    value={product.name}
                                                                    onChange={(e) => {
                                                                        const updatedProducts = [
                                                                            ...supplier.products,
                                                                        ];
                                                                        updatedProducts[index] = {
                                                                            ...product,
                                                                            name: e.target.value,
                                                                        };
                                                                        update(
                                                                            ref(db, `suppliers/${supplier.id}`),
                                                                            {
                                                                                products: updatedProducts,
                                                                            }
                                                                        );
                                                                    }}
                                                                />
                                                            ) : (
                                                                <span>{product.name}</span>
                                                            )}
                                                        </td>
                                                        <td>
                                                            {editingProduct?.supplierId === supplier.id &&
                                                                editingProduct?.productIndex === index ? (
                                                                <input
                                                                    type="number"
                                                                    value={product.price}
                                                                    onChange={(e) => {
                                                                        const updatedProducts = [
                                                                            ...supplier.products,
                                                                        ];
                                                                        updatedProducts[index] = {
                                                                            ...product,
                                                                            price: e.target.value,
                                                                        };
                                                                        update(
                                                                            ref(db, `suppliers/${supplier.id}`),
                                                                            {
                                                                                products: updatedProducts,
                                                                            }
                                                                        );
                                                                    }}
                                                                />
                                                            ) : (
                                                                <span>
                                                                    {parseFloat(product.price).toFixed(2)}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td>
                                                            <div className="product-action-icons">
                                                                {editingProduct?.supplierId === supplier.id &&
                                                                    editingProduct?.productIndex === index ? (
                                                                    <>
                                                                        <AiOutlineSave
                                                                            className="product-action-icon save-icon"
                                                                            onClick={() =>
                                                                                handleSaveEditedProduct(
                                                                                    supplier.id,
                                                                                    index,
                                                                                    product
                                                                                )
                                                                            }
                                                                            title="Save"
                                                                        />
                                                                        <AiOutlineClose
                                                                            className="product-action-icon cancel-icon"
                                                                            onClick={() => setEditingProduct(null)}
                                                                            title="Cancel"
                                                                        />
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <AiOutlineEdit
                                                                            className="product-action-icon edit-icon"
                                                                            onClick={() =>
                                                                                handleEditProduct(supplier.id, index)
                                                                            }
                                                                            title="Edit"
                                                                        />
                                                                        <AiOutlineDelete
                                                                            className="product-action-icon delete-icon"
                                                                            onClick={() =>
                                                                                handleRemoveProduct(supplier.id, index)
                                                                            }
                                                                            title="Delete"
                                                                        />
                                                                    </>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        <div className="add-product">
                                            <input
                                                type="text"
                                                placeholder="Product Name"
                                                value={newProduct.name}
                                                onChange={(e) =>
                                                    setNewProduct({ ...newProduct, name: e.target.value })
                                                }
                                            />
                                            <input
                                                type="number"
                                                placeholder="Price"
                                                value={newProduct.price}
                                                onChange={(e) =>
                                                    setNewProduct({
                                                        ...newProduct,
                                                        price: e.target.value,
                                                    })
                                                }
                                            />
                                            <button
                                                onClick={() =>
                                                    handleAddProduct(supplier.id, newProduct)
                                                }
                                            >
                                                <AiOutlinePlus />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="supplier-actions">
                                        <button
                                            className="edit-button"
                                            onClick={() => handleEditSupplier(supplier)}
                                        >
                                            <AiOutlineEdit /> Edit
                                        </button>
                                        <button
                                            className="delete-button"
                                            onClick={() => handleDeleteSupplier(supplier.id)}
                                        >
                                            <AiOutlineDelete /> Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                    </div>
                </>
            )}
        </div>
    );
}