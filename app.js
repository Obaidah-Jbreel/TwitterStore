const grid = document.getElementById("product-grid");
const pageTitle = document.querySelector("title");
const headerTitle = document.querySelector("header h1");

fetch("products.json")
  .then((response) => {
    if (!response.ok) {
      throw new Error(`Unable to load products.json (${response.status})`);
    }
    return response.json();
  })
  .then((data) => {
    const storeTitle = data.storeTitle || "TwitterStore";
    pageTitle.textContent = storeTitle;
    headerTitle.textContent = storeTitle;

    const productLinks = data.productLinks || {};
    const products = data.products || [];

    if (!products.length) {
      grid.innerHTML = '<p class="empty">No products found. Open products.json and add items.</p>';
      return;
    }

    const formatPriceILS = (value) => {
      const price = Number(value);
      if (Number.isNaN(price)) {
        return `${value} ILS`;
      }
      return new Intl.NumberFormat("en-IL", {
        style: "currency",
        currency: "ILS",
        maximumFractionDigits: 0,
      }).format(price);
    };

    const groupByCategory = (items) =>
      items.reduce((groups, item) => {
        const category = item.category || "Other";
        groups[category] = groups[category] || [];
        groups[category].push(item);
        return groups;
      }, {});

    const deviceParts = products.filter((product) => product.category !== "General");
    const generalItems = products.filter((product) => product.category === "General");
    const deviceGroups = groupByCategory(deviceParts);
    const categoryOrder = ["PS5", "PS4", "Xbox Series", "Xbox One", "Xbox 360"];

    const renderCards = (items) =>
      items
        .map((product) => {
          const url = productLinks[product.linkName] || product.url || "#";
          const description = product.description || product.shortDescription || "";

          return `
            <article class="card">
              <img src="${product.image}" alt="${product.name}" />
              <div class="card-body">
                <h2>${product.name}</h2>
                <p class="price">Price: <span style="color: green;">${formatPriceILS(product.price)}</span>   </p>
                <p class="price">Code: <bold>${product.code}</bold></p>
                ${description ? `<p class="desc">${description}</p>` : ""}
              </div>
            </article>
          `;
        })
        .join("");

    const renderCategorySection = (category, items) => `
      <section class="category-section">
        <h2>${category}</h2>
        <div class="grid">${renderCards(items)}</div>
      </section>
    `;

    grid.innerHTML = `
      <section class="product-section">
        <h1>قطع غيار</h1>
        ${categoryOrder
          .filter((category) => deviceGroups[category]?.length)
          .map((category) => renderCategorySection(category, deviceGroups[category]))
          .join("")}
        ${Object.keys(deviceGroups)
          .filter((category) => !categoryOrder.includes(category))
          .map((category) => renderCategorySection(category, deviceGroups[category]))
          .join("")}
      </section>
      ${generalItems.length
        ? `
          <section class="product-section">
            <h1>أدوات صيانة عامة</h1>
            <div class="grid">${renderCards(generalItems)}</div>
          </section>
        `
        : ""}
    `;
  })
  .catch((error) => {
    grid.innerHTML = `<p class="empty">Unable to load products: ${error.message}</p>`;
    console.error(error);
  });
