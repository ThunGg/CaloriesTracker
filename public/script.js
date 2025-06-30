document.getElementById("loginForm").addEventListener("submit", async function (e) {
  e.preventDefault();
  const username = this.username.value;
  const password = this.password.value;

  const res = await fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();
  if (data.success) {
    window.location.href = `/user/${username}`;
  } else {
    alert("Sai tên đăng nhập hoặc mật khẩu");
  }
});
