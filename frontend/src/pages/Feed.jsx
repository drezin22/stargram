// src/pages/Feed.jsx
import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import "../styles/feed.css";
import { useAuth } from "../auth/AuthContext.jsx"; // depois vamos adaptar esse contexto pro backend

// ideal: configurar em .env => VITE_API_BASE_URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5161";

// ✅ Componente principal do Feed
export default function Feed() {
  const { user, logout } = useAuth(); // user vindo da autenticação (.NET depois)
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // aplica o fundo exclusivo do feed no <body>
  useEffect(() => {
    document.body.classList.add("feed-bg");
    return () => document.body.classList.remove("feed-bg");
  }, []);

  // ajusta dinamicamente a altura da topbar → stories sempre visíveis
  useLayoutEffect(() => {
    const el = document.querySelector(".llm-topbar");
    if (!el) return;

    const apply = () => {
      const h = el.offsetHeight || 64;
      document.documentElement.style.setProperty("--topbar-h", `${h}px`);
    };

    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    window.addEventListener("resize", apply);
    window.addEventListener("load", apply);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", apply);
      window.removeEventListener("load", apply);
    };
  }, []);

  // 🚀 carrega posts da API .NET
  useEffect(() => {
    async function loadPosts() {
      try {
        setLoading(true);
        setLoadError("");

        const res = await fetch(`${API_BASE_URL}/api/posts`);
        if (!res.ok) {
          throw new Error("Erro ao carregar o feed.");
        }

        const data = await res.json();
        // esperamos algo como: [{ id, userName, userAvatarUrl, caption, imageUrl, createdAt, likesCount, isLikedByCurrentUser }]
        setPosts(data);
      } catch (err) {
        console.error(err);
        setLoadError(err.message || "Erro ao carregar o feed.");
        setPosts([]);
      } finally {
        setLoading(false);
      }
    }

    loadPosts();
  }, []);

  // atualiza um post específico na lista (quando curtimos, comentamos, etc.)
  function handlePostUpdated(updated) {
    setPosts((prev) =>
      prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p))
    );
  }

  // adiciona post recém-criado (quando o backend devolver o objeto salvo)
  function handlePostCreated(created) {
    setPosts((prev) => [created, ...prev]);
  }

  return (
    <div className="llm-wrap">
      <TopBar onLogout={logout} user={user} />

      <main className="llm-main">
        {/* ⬅️ Left nav */}
        <LeftNav />

        {/* 🏠 coluna central */}
        <section className="llm-col">
          <StoriesCarousel user={user} />
          <Composer user={user} onPostCreated={handlePostCreated} />

          {loading ? (
            <>
              <PostSkeleton />
              <PostSkeleton />
            </>
          ) : loadError ? (
            <div className="card empty">
              <h3>Não foi possível carregar o feed</h3>
              <p className="muted">{loadError}</p>
            </div>
          ) : posts.length === 0 ? (
            <EmptyState />
          ) : (
            posts.map((p) => (
              <PostCard
                key={p.id}
                post={p}
                user={user}
                onPostUpdated={handlePostUpdated}
              />
            ))
          )}
        </section>

        {/* ➡️ aside direito */}
        <aside className="llm-aside">
          <ProfileCard user={user} />
          <Suggestions />
          <FooterLinks />
        </aside>
      </main>
    </div>
  );
}

/* ===================== TopBar ===================== */
function TopBar({ onLogout, user }) {
  return (
    <header className="llm-topbar">
      <div className="llm-topbar__inner">
        <div className="llm-logo">
          <img src="/img/logo.png" alt="Stargram" className="llm-logo-img" />
        </div>

        <div className="llm-actions">
          <div className="search">
            <input placeholder="Pesquisar" aria-label="Pesquisar" />
          </div>

          <button className="logout-btn" title="Sair" onClick={onLogout}>
            Sair
          </button>

             <Avatar
            src={user?.avatarUrl}
            title={user?.userName || user?.email}
            variant="sm"
          />
        </div>
      </div>
    </header>
  );
}

/* ===================== Left Nav ===================== */
function LeftNav() {
  const items = [
    { id: "home", label: "Página inicial", icon: "🏠" },
    { id: "search", label: "Pesquisa", icon: "🔎" },
    { id: "explore", label: "Explorar", icon: "🧭" },
    { id: "reels", label: "Reels", icon: "🎞️" },
    { id: "messages", label: "Mensagens", icon: "💬" },
    { id: "notifs", label: "Notificações", icon: "⭐" },
    { id: "create", label: "Criar", icon: "➕" },
    { id: "profile", label: "Perfil", icon: "👤" },
    { id: "more", label: "Mais", icon: "☰" },
  ];

  return (
    <nav className="llm-leftnav">
      <div className="llm-leftnav__inner">
        <ul>
          {items.map((it, idx) => (
            <li key={it.id} className={idx === 0 ? "active" : ""}>
              <a href="#">
                <span className="ico" aria-hidden>
                  {it.icon}
                </span>
                <span className="txt">{it.label}</span>
              </a>
            </li>
          ))}
        </ul>

        <div className="llm-leftnav__meta">
          <small className="muted">Também da Meta</small>
        </div>
      </div>
    </nav>
  );
}

/* ===================== Stories: carrossel c/ setas ===================== */
function StoriesCarousel({ user }) {
  const people = useMemo(() => {
  const base = [
    {
      id: "me",
      name: user?.userName || user?.email?.split("@")[0] || "Você",
      img: user?.avatarUrl,
    },
      { id: 1, name: "fernanda.dev", img: `https://i.pravatar.cc/150?img=1` },
      { id: 2, name: "techshop", img: `https://i.pravatar.cc/150?img=2` },
      { id: 3, name: "fiap.on", img: `https://i.pravatar.cc/150?img=3` },
      { id: 4, name: "icrx", img: `https://i.pravatar.cc/150?img=4` },
      { id: 5, name: "stargram.app", img: `https://i.pravatar.cc/150?img=5` },
      { id: 6, name: "andre", img: `https://i.pravatar.cc/150?img=6` },
      { id: 7, name: "pet.south", img: `https://i.pravatar.cc/150?img=7` },
      { id: 8, name: "dev.lab", img: `https://i.pravatar.cc/150?img=8` },
      { id: 9, name: "uiux", img: `https://i.pravatar.cc/150?img=9` },
      { id: 10, name: "next.js", img: `https://i.pravatar.cc/150?img=10` },
    ];
    return base;
  }, [user]);

  const trackRef = useRef(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const updateArrows = () => {
    const el = trackRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanLeft(scrollLeft > 0);
    setCanRight(scrollLeft + clientWidth < scrollWidth - 1);
  };

  useEffect(() => {
    updateArrows();
    const el = trackRef.current;
    if (!el) return;
    const onScroll = () => updateArrows();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateArrows);
    };
  }, []);

  const STEP = 5; // quantos “cards” por clique
  const CARD_W = 88; // largura aproximada do story (px) — casa com o CSS

  function go(dir) {
    const el = trackRef.current;
    if (!el) return;
    const delta = dir === "left" ? -STEP * CARD_W : STEP * CARD_W;
    el.scrollBy({ left: delta, behavior: "smooth" });
  }

  return (
    <div className="stories-wrap">
      <button
        className="stories-arrow left"
        disabled={!canLeft}
        aria-label="Ver stories anteriores"
        onClick={() => go("left")}
      >
        ‹
      </button>

      <div className="stories-track" ref={trackRef}>
        {people.map((p) => (
          <button key={p.id} className="story">
            <span className="ring">
              <Avatar src={p.img} title={p.name} variant="lg" />
            </span>
            <small>{p.name}</small>
          </button>
        ))}
        <div className="stories-fade left" />
        <div className="stories-fade right" />
      </div>

      <button
        className="stories-arrow right"
        disabled={!canRight}
        aria-label="Ver próximos stories"
        onClick={() => go("right")}
      >
        ›
      </button>
    </div>
  );
}

/* ===================== Composer (criar post) ===================== */
/* ===================== Composer (criar post) ===================== */
function Composer({ user, onPostCreated }) {
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);

  async function handlePublish(e) {
    e.preventDefault();
    if (!user) {
      alert("Faça login novamente.");
      return;
    }
    if (!file && !caption.trim()) {
      alert("Escreva algo ou envie uma mídia.");
      return;
    }

    try {
      setBusy(true);

      let createdPost;

      if (file) {
        const form = new FormData();
        form.append("caption", caption.trim());
        form.append("userId", user.id);     // 👈 usa o id do backend
        form.append("file", file);

        const res = await fetch(`${API_BASE_URL}/api/posts`, {
          method: "POST",
          body: form,
        });
        if (!res.ok) throw new Error("Erro ao publicar o post.");
        createdPost = await res.json();
      } else {
        const res = await fetch(`${API_BASE_URL}/api/posts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            caption: caption.trim(),
            userId: user.id,               // 👈 idem aqui
          }),
        });
        if (!res.ok) throw new Error("Erro ao publicar o post.");
        createdPost = await res.json();
      }

      setCaption("");
      setFile(null);
      if (fileRef.current) fileRef.current.value = "";
      onPostCreated?.(createdPost);
    } catch (err) {
      console.error(err);
      alert(err.message || "Erro ao publicar. Tente novamente.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="composer" onSubmit={handlePublish}>
      {/* 👇 avatar do usuário vindo do backend */}
      <Avatar src={user?.avatarUrl} variant="sm" />

      <input
        className="composer-input"
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        placeholder="Escreva uma legenda…"
        maxLength={2200}
      />

      <label className="btn btn-attach filebtn">
        <input
          ref={fileRef}
          type="file"
          accept="image/*,video/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          hidden
        />
        {file ? `Mídia: ${file.name.slice(0, 24)}` : "Anexar"}
      </label>

      <button className="btn btn-publish" disabled={busy}>
        {busy ? "Publicando…" : "Publicar"}
      </button>
    </form>
  );
}


/* ===================== Post ===================== */
function PostCard({ post, user, onPostUpdated }) {
  const [liking, setLiking] = useState(false);

  const likeCount =
    post.likesCount ?? post.likedBy?.length ?? post.likeCount ?? 0;

const isLiked =
  post.isLikedByCurrentUser ??
  post.likedBy?.includes(user?.id) ??
  false;



  async function toggleLike() {
    if (!user) return;
    setLiking(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/posts/${post.id}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
  userId: user.id,
}),

      });
      if (!res.ok) throw new Error("Erro ao curtir o post.");
      const updated = await res.json();
      onPostUpdated?.(updated);
    } catch (e) {
      console.error(e);
    } finally {
      setLiking(false);
    }
  }

  const ownerName =
    post.userName ||
    post.displayName ||
    post.email?.split?.("@")[0] ||
    "star";

  return (
    <article className="post">
      <header className="post__head">
        <div className="left">
          <Avatar
            src={post.userAvatarUrl || post.photoURL}
            variant="sm"
            title={ownerName}
          />
          <div className="meta">
            <b>{ownerName}</b>
            <span className="muted">{formatDate(post.createdAt)}</span>
          </div>
        </div>
        <button className="icon ghost" title="Mais ações">
          ⋯
        </button>
      </header>

      {post.imageUrl && <Media url={post.imageUrl} alt={post.caption} />}

      <div className="post__actions">
        <div className="left">
          <button
            className={`icon ${isLiked ? "liked" : ""}`}
            onClick={toggleLike}
            disabled={liking}
          >
            ★
          </button>
          <CommentsButton postId={post.id} />
          <button className="icon" title="Compartilhar">
            ⤴
          </button>
        </div>
        <button className="icon" title="Salvar">
          ⎘
        </button>
      </div>

      <div className="post__body">
        {likeCount > 0 && (
          <b className="likes">
            {likeCount} curtida{likeCount > 1 ? "s" : ""}
          </b>
        )}
        {post.caption && (
          <p>
            <b>{ownerName}</b> {post.caption}
          </p>
        )}

        {/* Comentários simplificados – backend depois */}
        <button
          className="muted link"
          onClick={() => alert("Comentários completos em breve 🙂")}
        >
          Ver comentários
        </button>

        <CommentComposer postId={post.id} user={user} />
      </div>
    </article>
  );
}

function Media({ url, alt }) {
  const isVideo = /\.mp4|\.webm|\.ogg/i.test(url || "");
  return isVideo ? (
    <video className="media" src={url} controls playsInline />
  ) : (
    <img className="media" src={url} alt={alt || "post"} />
  );
}

/* ========== CommentComposer – manda para API, mas não recarrega lista ainda ========== */
function CommentComposer({ postId, user }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!text.trim()) return;
    setBusy(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
               body: JSON.stringify({
          text: text.trim(),
          userId: user?.id,   // ✅ agora usa o id do usuário do backend
        }),

      });
      if (!res.ok) throw new Error("Erro ao enviar comentário.");
      // opcional: const created = await res.json();
      setText("");
    } catch (e) {
      console.error(e);
      alert(e.message || "Erro ao comentar.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="comment" onSubmit={submit}>
      <input
        placeholder="Adicione um comentário…"
        value={text}
        onChange={(e) => setText(e.target.value)}
        maxLength={300}
      />
      <button className="link" disabled={busy || !text.trim()}>
        Publicar
      </button>
    </form>
  );
}

function CommentsButton() {
  return (
    <button className="icon" title="Comentar">
      💬
    </button>
  );
}

/* ===================== Side ===================== */
function ProfileCard({ user }) {
  const name = user?.userName || user?.email?.split("@")[0] || "Você";

  return (
    <div className="card profile">
      <div className="row">
        <Avatar src={user?.avatarUrl} title={name} variant="md" />
        <div>
          <b>{name}</b>
          <div className="muted">{user?.email}</div>
        </div>
      </div>
      <button
        className="btn btn-edit"
        onClick={() => alert("Editar perfil em breve")}
      >
        Editar perfil
      </button>
    </div>
  );
}


function Suggestions() {
  const list = [
    { id: 1, name: "fiap.on", img: "https://i.pravatar.cc/150?img=11" },
    { id: 2, name: "techshop", img: "https://i.pravatar.cc/150?img=12" },
    { id: 3, name: "icrx", img: "https://i.pravatar.cc/150?img=13" },
  ];
  return (
    <div className="card">
      <div className="row between">
        <b>Sugestões para você</b>
        <button
          className="link muted"
          onClick={() => alert("Ver todas em breve")}
        >
          Ver tudo
        </button>
      </div>
      {list.map((p) => (
        <div key={p.id} className="row between" style={{ marginTop: 12 }}>
          <div className="row">
            <Avatar src={p.img} title={p.name} variant="sm" />
            <div>
              <b>{p.name}</b>
              <div className="muted">Novo no Stargram</div>
            </div>
          </div>
          <button className="btn btn-follow small">Seguir</button>
        </div>
      ))}
    </div>
  );
}

function FooterLinks() {
  return (
    <div className="footer-links">
      <span>Sobre • Ajuda • API • Privacidade • Termos • Localizações</span>
      <small className="muted">
        © {new Date().getFullYear()} Stargram
      </small>
    </div>
  );
}

/* ===================== Helpers ===================== */
function Avatar({ src, title = "", variant = "md" }) {
  return (
    <img
      className={`avatar avatar-${variant}`}
      src={src || fallbackAvatar(title || "user")}
      alt={title || "avatar"}
    />
  );
}

function EmptyState() {
  return (
    <div className="card empty">
      <h3>Seu Feed está vazio</h3>
      <p className="muted">Siga pessoas ou publique algo para começar ✨</p>
    </div>
  );
}

function PostSkeleton() {
  return (
    <div className="post skel">
      <div className="post__head">
        <div className="left">
          <div className="s-avatar" />
          <div className="s-lines">
            <div className="s-line" />
            <div className="s-line short" />
          </div>
        </div>
      </div>
      <div className="s-media" />
      <div className="s-lines" style={{ padding: 12 }}>
        <div className="s-line" />
        <div className="s-line short" />
      </div>
    </div>
  );
}

function fallbackAvatar(seed = "user") {
  return `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(
    seed
  )}`;
}

function formatDate(ts) {
  try {
    if (!ts) return "agora";
    const date =
      ts instanceof Date
        ? ts
        : typeof ts === "string"
        ? new Date(ts)
        : ts?.toDate
        ? ts.toDate()
        : new Date();
    const diff = Date.now() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "agora";
    if (mins < 60) return `${mins} min`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} h`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days} d`;
    return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(
      date
    );
  } catch {
    return "agora";
  }
}
