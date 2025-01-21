document.addEventListener("DOMContentLoaded", () => {
  const tagInput = document.getElementById("tag");
  const valueInput = document.getElementById("value");
  const addButton = document.getElementById("add-btn");
  const dataContainer = document.getElementById("data-container");
  const searchInput = document.getElementById("search");
  const notification = document.getElementById("notification");

  const STATIC_PASSWORD = "yourStaticPassword";

  const encrypt = (data, password) => {
    return btoa(JSON.stringify(data) + password);
  };

  const decrypt = (encryptedData, password) => {
    const decoded = atob(encryptedData);
    if (!decoded.endsWith(password)) throw new Error("Incorrect password");
    return JSON.parse(decoded.slice(0, -password.length));
  };

  const loadData = () => {
    const encryptedData = localStorage.getItem("formData");
    if (!encryptedData) return;

    try {
      const data = decrypt(encryptedData, STATIC_PASSWORD);
      renderData(data);
    } catch (error) {
      showNotification("Incorrect password. Unable to load data.");
    }
  };

  const saveData = (data) => {
    const encryptedData = encrypt(data, STATIC_PASSWORD);
    localStorage.setItem("formData", encryptedData);
  };

  const renderData = (data) => {
    dataContainer.innerHTML = "";
    data.forEach(({ tag, value }, index) => {
      const li = document.createElement("li");
      li.className =
        "flex justify-between items-center p-2 bg-gray-100 shadow";
      li.style.borderRadius = "12px";
      li.innerHTML = `
            <span class="text-blue-500 font-semibold">${tag}:</span>
            <span class="truncate max-w-xs">${value}</span>
            <div class="flex space-x-2">
              <button
                class="copy-btn text-green-500"
                data-value="${value}"
              >
                Copy
              </button>
              <button
                class="delete-btn text-red-500"
                data-index="${index}"
              >
                Delete
              </button>
            </div>
          `;
      dataContainer.appendChild(li);
    });
  
    document.querySelectorAll(".delete-btn").forEach((btn) =>
      btn.addEventListener("click", (e) => {
        const index = e.target.getAttribute("data-index");
        deleteData(index);
      })
    );
  
    document.querySelectorAll(".copy-btn").forEach((btn) =>
      btn.addEventListener("click", (e) => {
        const value = e.target.getAttribute("data-value");
        copyToClipboard(value);
      })
    );
  };

  const deleteData = (index) => {
    const encryptedData = localStorage.getItem("formData");

    try {
      const data = decrypt(encryptedData, STATIC_PASSWORD);
      data.splice(index, 1);
      saveData(data);
      renderData(data);
      showNotification("Data deleted successfully.");
    } catch (error) {
      showNotification("Incorrect password. Unable to delete data.");
    }
  };

  const handleAdd = () => {
    const tag = tagInput.value.trim();
    const value = valueInput.value.trim();

    if (!tag || !value) {
      showNotification("Please enter both tag and value.");
      return;
    }

    const encryptedData = localStorage.getItem("formData");

    try {
      const data = encryptedData ? decrypt(encryptedData, STATIC_PASSWORD) : [];
      data.push({ tag, value });
      saveData(data);
      renderData(data);
      tagInput.value = "";
      valueInput.value = "";
      showNotification("Data added successfully.");
    } catch (error) {
      showNotification("Incorrect password. Unable to add data.");
    }
  };

  const handleSearch = () => {
    const query = searchInput.value.toLowerCase();
    const encryptedData = localStorage.getItem("formData");

    try {
      const data = decrypt(encryptedData, STATIC_PASSWORD);
      const filteredData = data.filter(({ tag }) =>
        tag.toLowerCase().includes(query)
      );
      renderData(filteredData);
    } catch (error) {
      showNotification("Incorrect password. Unable to search data.");
    }
  };

  const copyToClipboard = (value) => {
    const tempInput = document.createElement("input");
    tempInput.value = value;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand("copy");
    document.body.removeChild(tempInput);
    showNotification("Copied to clipboard: " + value);
  };

  const showNotification = (message) => {
    notification.textContent = message;
    notification.classList.remove("hidden");
    setTimeout(() => {
      notification.classList.add("hidden");
    }, 3000);
  };

  addButton.addEventListener("click", handleAdd);
  searchInput.addEventListener("input", handleSearch);

  loadData();
});