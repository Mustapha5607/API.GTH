const GITHUB_TOKEN = "";  

const headers = GITHUB_TOKEN 
  ? { "Authorization": `token ${GITHUB_TOKEN}` } 
  : {};

async function chercherProfil() {
  const pseudo = document.getElementById("username").value.trim();
  if (!pseudo) {
    alert("Entre un pseudo GitHub svp !");
    return;
  }

  const result = document.getElementById("result");
  result.innerHTML = "<p>Chargement...</p>";

  try {
    const [resUser, resRepos] = await Promise.all([
      fetch(`https://api.github.com/users/${pseudo}`, { headers }),
      fetch(`https://api.github.com/users/${pseudo}/repos`, { headers })
    ]);

    if (resUser.status === 403) {
      throw new Error(
        "Limite GitHub dépassée (rate limit).\n" +
        "→ Sans token : 60 req/h\n" +
        "→ Avec token : 5000 req/h\n" +
        "Attends 1h ou crée un token personnel."
      );
    }

    if (!resUser.ok) {
      throw new Error(`Erreur ${resUser.status} : ${resUser.statusText}`);
    }

    const user = await resUser.json();
    let repos = await resRepos.json();

    repos.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

    const top5 = repos.slice(0, 5);

    let html = `
      <h2>${user.name || user.login} (@${user.login})</h2>
      <img src="${user.avatar_url}" alt="Avatar de ${user.login}" width="120">
      ${user.bio ? `<p><em>${user.bio}</em></p>` : ""}
      <p>📍 ${user.location || "Non renseigné"} • 👥 ${user.followers} followers • 🔭 ${user.public_repos} dépôts publics</p>
      
      <h3>5 derniers dépôts mis à jour :</h3>
    `;

    if (top5.length === 0) {
      html += "<p>Aucun dépôt public trouvé.</p>";
    } else {
      html += "<ul>";
      top5.forEach(repo => {
        html += `
          <li>
            <a href="${repo.html_url}" target="_blank">${repo.name}</a>
            <div>${repo.description || "<em>Pas de description</em>"}</div>
            <small>Mis à jour : ${new Date(repo.updated_at).toLocaleDateString("fr-FR")}</small>
          </li>
        `;
      });
      html += "</ul>";
    }

    result.innerHTML = html;

  } catch (err) {
    result.innerHTML = `<p class="error">Erreur : ${err.message}</p>`;
    console.error(err);
  }
}