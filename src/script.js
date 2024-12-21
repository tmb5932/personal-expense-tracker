document.addEventListener("DOMContentLoaded", () => {
  // Get today's date in the format YYYY-MM-DD
  const today = new Date().toISOString().split("T")[0];

  // Set the default value of the date input to today's date
  document.getElementById("date").value = today;

  const form = document.getElementById("purchaseForm");
  const statusMessage = document.getElementById("statusMessage");
  const purchasesTable = document.getElementById("purchasesTable");

  // Handle form submission
  form?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("date", form.date.value);
    formData.append("business", form.business.value);
    formData.append("amount", parseFloat(form.amount.value));
    formData.append("category", form.category.value);
    formData.append("description", form.description.value);

    const photoFile = form.photo.files[0];
    if (photoFile) {
      formData.append("photo", photoFile);
    }

    try {
      const response = await fetch("/add", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        statusMessage.textContent = "Purchase added successfully!";
        form.reset();
      } else {
        statusMessage.textContent = "Error adding purchase.";
      }
    } catch (error) {
      console.error("Error:", error);
      statusMessage.textContent = "An unexpected error occurred.";
    }
  });

  // Populate the purchases table if it exists
  if (purchasesTable) {
    fetch("/month-data") // Adjust endpoint to fetch monthly data
      .then((response) => response.json())
      .then((purchases) => {
        const tbody = purchasesTable.querySelector("tbody");
        purchases.forEach((purchase) => {
          const row = document.createElement("tr");
          row.innerHTML = `
                        <td>${purchase.date}</td>
                        <td>${purchase.business}</td>
                        <td>${purchase.amount.toFixed(2)}</td>
                        <td>${purchase.category}</td>
                        <td>${purchase.description}</td>
                        <td>
                            ${
                              purchase.photo
                                ? `<img src="data:image/jpeg;base64,${purchase.photo}" alt="Purchase Photo" style="max-width: 100px; max-height: 100px;">`
                                : "No Photo"
                            }
                        </td>
                    `;
          tbody.appendChild(row);
        });
      })
      .catch((error) => {
        console.error("Error fetching purchases:", error);
      });
  }
});
