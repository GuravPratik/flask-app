const url = "http://127.0.0.1:5000";

function cleanUp() {
  $("#output").empty();
  $("#user-edit").empty();
  $("#album-edit").empty();
  $("#images").empty();
}

$(document).ready(function () {
  $.get(url + "/users", (users) => {
    let rowsFromJson = "";

    users.forEach((user) => {
      rowsFromJson += `<tr>
        <td onclick="getUserDetails(${user.id})" style="cursor: pointer;" class="align-right">${user.id}</td>
        <td onclick="getAlbumsInfo(${user.id}, '${user.name}')" style="cursor: pointer;">${user.name}</td>
        <td>${user.username}</td>
        <td>
          <div>
            <button onclick="editUser(${user.id})">
                <span class="material-symbols-outlined"> edit </span>
            </button>
              <button onclick="deleteUser(${user.id})">
                <span class="material-symbols-outlined"> delete </span>
              </button>
            </div>
          </td>
      </tr>`;
    });

    $("#content").html(rowsFromJson);
  });
});

function getUserDetails(userId) {
  cleanUp();
  $.get(url + `/users/${userId}`, (user) => {
    const details = `
      <div>
        <h2>User Details</h2>
      </div>
      <div>
        <div class="user-details">
          <label>ID:</label>
          <span>${user.id}</span>
        </div>
        <div class="user-details">
          <label>Name:</label>
          <span>${user.name}</span>
        </div>
        <div class="user-details">
          <label>Username:</label>
          <span>${user.username}</span>
        </div>
        <div class="user-details">
          <label>Email:</label>
          <span>${user.email}</span>
        </div>
        <div class="user-details">
          <label>Phone:</label>
          <span>${user.phone}</span>
        </div>
        <div class="user-details">
          <label>Website:</label>
          <span>${user.website}</span>
        </div>
        <div class="user-details">
          <label>Address:</label>
          <span>${user.address.street} ${user.address.suite}, ${user.address.city}, ${user.address.zipcode}</span>
        </div>
        <div class="user-details">
          <label>Company:</label>
          <span>${user.company.name}</span>
        </div>
        <div class="user-details">
          <label>BS:</label>
          <span>${user.company.bs}</span>
        </div>
      </div>`;

    $(".container").html(details);
  });
}

$("#add-user").on("click", createUser);

function createUser() {
  cleanUp();
  $(".container").html(`
    <h1>Create User</h1>
    <form id="create-form" method="POST">
      <p>Name: <input type="text" name="name" /></p>
      <p>Username: <input type="text" name="username" /></p>
      <p>Email: <input type="text" name="email" /></p>
      <p>
        Address:
        <input type="text" name="street" placeholder="Street" />
        <input type="text" name="suite" placeholder="Suite" />
        <input type="text" name="city" placeholder="City" />
        <input type="text" name="zipcode" placeholder="Zipcode" />
      </p>
      <p>Phone: <input type="text" name="phone" /></p>
      <p>Website: <input type="text" name="website" /></p>
      <p>Company Name: <input type="text" name="company_name" /></p>
      <p>Company BS: <input type="text" name="bs" /></p>
      <input type="submit" value="Create" />
    </form>
  `);

  $("#create-form").submit(function (event) {
    event.preventDefault();

    const formData = $(this).serialize();

    $.ajax({
      type: "POST",
      url: url + "/add_user",
      data: formData,
      success: function () {
        alert("User creation successful");
      },
      error: function (error) {
        console.error("Creation failed", error);
      },
    });
  });
}

function editUser(userId) {
  cleanUp();
  // Make a request to get the user data for the specified userId
  $.get(url + "/users/" + userId, (user) => {
    // Populate the form with the user data for editing
    $(".container").html(`
      <h1>Edit User</h1>
      <form id="update-form" method="POST">
        <p>Name: <input type="text" name="name" value="${user.name}" /></p>
        <p>Username: <input type="text" name="username" value="${user.username}" disabled /></p>
        <p>
        Email: <input type="text" name="email" value="${user.email}" />
      </p>
      <p>
        Address:
        <input
          type="text"
          name="street"
          placeholder="Street"
          value="${user.address.street}"
        />
        <input
          type="text"
          name="suite"
          placeholder="Suite"
          value="${user.address.suite}"
        />
        <input
          type="text"
          name="city"
          placeholder="City"
          value="${user.address.city}"
        />
        <input
          type="text"
          name="zipcode"
          placeholder="Zipcode"
          value="${user.address.zipcode}"
        />
      </p>
      <p>
        Phone: <input type="text" name="phone" value="${user.phone}" />
      </p>
      <p>
        Website:
        <input type="text" name="website" value="${user.website}" />
      </p>
      <p>
        Company Name:
        <input
          type="text"
          name="company_name"
          value="${user.company.name}"
        />
      </p>
      <p>
        Company BS:
        <input type="text" name="bs" value="${user.company.bs}" />
      </p>
        <input type="submit" value="Update" />
      </form>
    `);

    $("#update-form").submit(function (event) {
      event.preventDefault();

      const formData = $(this).serialize();

      $.ajax({
        type: "POST",
        url: url + "/edit/" + userId,
        data: formData,
        success: function () {
          alert("User Update successful");
        },
        error: function (error) {
          console.error("Update failed", error);
        },
      });
    });
  });
}

function deleteUser(userId) {
  $.post(`${url}/user/delete/${userId}`, (d) => {
    alert(d.message);
  });
}

function getAlbumsInfo(userId, userName) {
  $("#output").empty();
  $("#output").html(`
  <div>
    <div>
      <h2>${userName} Albums Info</h2>
      <button onclick="createAlbum(${userId})">Add new Album</button>
    </div>
    <div id="info">
      <table>
        <thead>
          <tr>
            <th>UserId</th>
            <th>Album Id</th>
            <th>Title</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody id="data"></tbody>
      </table>
    </div>
  </div>
  `);

  $.get(url + `/albums?userId=${userId}`, (albums) => {
    let rowsFromJson = "";

    if (albums.length === 0) {
      $("#info").html(`
      <h1 style="margin:10px 0;">Nothing to show...</h1>
      `);
      return;
    }

    albums.forEach((album) => {
      rowsFromJson += `<tr>
          <td class="align-right">${album.userId}</td>
          <td class="align-right">${album.id}</td>
          <td onclick="getPhotos(${album.id}, '${album.title}')" style="cursor: pointer;">${album.title}</td>
          <td>
          <div>
            <button onclick="editAlbum(${album.id})">
                <span class="material-symbols-outlined"> edit </span>
            </button>
              <button onclick="deleteAlbum(${album.id})">
                <span class="material-symbols-outlined"> delete </span>
              </button>
            </div>
          </td>
          </tr>`;
    });

    $("#data").html(rowsFromJson);
  });
}

function editAlbum(albumId) {
  cleanUp();

  $.get(`${url}/albums/details?albumId=${albumId}`, (data) => {
    console.log(data);
    $(".container").html(
      `
        <h2>Edit Album </h2>
        <form id="update-form" method="POST">
          <div>
            <label for="albumId">Album Id</label>
            <input id="albumId" value=${data.id} disabled/>
          </div>
          <div>
            <label>UserId</label>
            <input value=${data.userId} disabled/>
          </div>
          <div>
            <label for="albumTitle">Title</label>
            <input id="albumTitle" name="title" value="${data.title}" />
          </div>
          <input type="submit" value="Update" />
        </form>
      `
    );
    $("#update-form").submit(function (event) {
      event.preventDefault();

      const formData = $(this).serialize();

      $.ajax({
        type: "POST",
        url: `${url}/albums/edit?albumId=${albumId}`,
        data: formData,
        success: function (response) {
          alert(response.message);
          window.location.reload();
        },
        error: function (error) {
          alert("Update failed", error);
          console.log("Update failed");
        },
      });
    });
  });
}

function createAlbum(userId) {
  cleanUp();
  $(".container").html(`
    <div>
    <h2>Create new album</h2>
    </div>
    <div>
      <form id="create-form" method="POST">
        <label for="title">Title</label>
        <input id="title" name="title" type="text"/>
        <input type="submit" value="create" />
      </form>
    </div>  
  `);

  $("#create-form").submit(function (event) {
    event.preventDefault();

    const formData = $(this).serialize();
    $.ajax({
      type: "POST",
      url: `${url}/add/albums?userId=${userId}`,
      data: formData,
      success: function (response) {
        alert(response.message);
      },
      error: function (error) {
        console.error("Creation failed", error);
      },
    });
  });
}

function deleteAlbum(albumId) {
  $.post(`${url}/album/delete?albumId=${albumId}`, (response) => {
    alert(response.message);
  });
}

function getPhotos(albumId, title) {
  $.get(url + `/albums/photos?albumId=${albumId}`, (photos) => {
    const photosDiv = $("#images");
    if (photos.length === 0) {
      photosDiv.html(`
          <h1 style="margin:10px 0;">Nothing to show...</h1>
        `);
      return;
    }

    photosDiv.html(`<h3>${title} Albums Photos</h3>`);

    const gridContainer = $("<div>").addClass("photo-grid");
    photosDiv.append(gridContainer);

    photos.forEach(function (photo) {
      const img = $("<img>")
        .attr("src", photo.thumbnailUrl)
        .attr("alt", photo.title);
      gridContainer.append(img);
    });
  });
}
