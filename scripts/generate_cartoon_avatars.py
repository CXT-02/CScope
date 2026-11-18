"""
Generate cute, modern, vector cartoon avatars for CScope user profiles.
These SVGs are 100% self-contained, offline-compatible, and look stunning.
"""
import os

AVATAR_DIR = os.path.join(os.path.dirname(__file__), '..', 'frontend', 'public', 'avatars')
os.makedirs(AVATAR_DIR, exist_ok=True)

# 1. 极客小明 (Boy Coder)
SVG_BOY_GEEK = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <linearGradient id="bg-boy" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3b82f6" />
      <stop offset="100%" stop-color="#1d4ed8" />
    </linearGradient>
    <linearGradient id="hair-boy" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#334155" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>
    <linearGradient id="hoodie-boy" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e293b" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>
    <filter id="shadow-boy" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="3" stdDeviation="3" flood-opacity="0.25" />
    </filter>
  </defs>

  <!-- Background Circle -->
  <circle cx="60" cy="60" r="56" fill="url(#bg-boy)" />
  <circle cx="60" cy="60" r="54" fill="none" stroke="#60a5fa" stroke-width="2" stroke-opacity="0.4" />

  <!-- Body / Hoodie -->
  <path d="M 26 112 C 28 88, 44 82, 60 82 C 76 82, 92 88, 94 112 Z" fill="url(#hoodie-boy)" filter="url(#shadow-boy)" />
  <path d="M 52 83 L 60 96 L 68 83 Z" fill="#38bdf8" opacity="0.9" />
  <circle cx="56" cy="98" r="2" fill="#94a3b8" />
  <circle cx="64" cy="98" r="2" fill="#94a3b8" />

  <!-- Neck -->
  <rect x="53" y="72" width="14" height="15" rx="4" fill="#fbcfe8" opacity="0.4" />
  <rect x="53" y="70" width="14" height="15" rx="4" fill="#fed7aa" />

  <!-- Head / Face -->
  <ellipse cx="60" cy="54" rx="23" ry="24" fill="#fed7aa" />

  <!-- Ears -->
  <circle cx="37" cy="54" r="5.5" fill="#fed7aa" />
  <circle cx="83" cy="54" r="5.5" fill="#fed7aa" />

  <!-- Hair (Back & Front Bangs) -->
  <path d="M 37 50 C 36 34, 46 22, 60 22 C 74 22, 84 34, 83 50 C 80 43, 76 34, 60 34 C 44 34, 40 43, 37 50 Z" fill="url(#hair-boy)" />
  <path d="M 40 37 C 48 30, 56 38, 62 33 C 68 38, 76 33, 80 42 C 74 38, 67 40, 60 38 C 51 41, 45 36, 40 37 Z" fill="url(#hair-boy)" />

  <!-- Cheeks Blush -->
  <ellipse cx="46" cy="60" rx="3.5" ry="2" fill="#fb7185" opacity="0.5" />
  <ellipse cx="74" cy="60" rx="3.5" ry="2" fill="#fb7185" opacity="0.5" />

  <!-- Big Geek Glasses -->
  <rect x="42" y="47" width="15" height="12" rx="4" fill="#e0f2fe" fill-opacity="0.3" stroke="#0f172a" stroke-width="2.2" />
  <rect x="63" y="47" width="15" height="12" rx="4" fill="#e0f2fe" fill-opacity="0.3" stroke="#0f172a" stroke-width="2.2" />
  <path d="M 57 53 L 63 53" stroke="#0f172a" stroke-width="2.2" stroke-linecap="round" />
  <path d="M 37 52 L 42 52" stroke="#0f172a" stroke-width="1.8" />
  <path d="M 78 52 L 83 52" stroke="#0f172a" stroke-width="1.8" />

  <!-- Eyes behind glasses -->
  <circle cx="49.5" cy="53" r="2.5" fill="#0f172a" />
  <circle cx="50.5" cy="52" r="1" fill="#ffffff" />
  <circle cx="70.5" cy="53" r="2.5" fill="#0f172a" />
  <circle cx="71.5" cy="52" r="1" fill="#ffffff" />

  <!-- Smile -->
  <path d="M 56 64 Q 60 68 64 64" fill="none" stroke="#0f172a" stroke-width="2" stroke-linecap="round" />

  <!-- Headphone around neck -->
  <path d="M 36 70 C 36 84, 84 84, 84 70" fill="none" stroke="#38bdf8" stroke-width="5" stroke-linecap="round" />
  <rect x="33" y="65" width="7" height="12" rx="3" fill="#0284c7" />
  <rect x="80" y="65" width="7" height="12" rx="3" fill="#0284c7" />
</svg>'''

# 2. 编程少女 (Girl Coder)
SVG_GIRL_CODER = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <linearGradient id="bg-girl" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ec4899" />
      <stop offset="100%" stop-color="#8b5cf6" />
    </linearGradient>
    <linearGradient id="hair-girl" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#472615" />
      <stop offset="100%" stop-color="#271207" />
    </linearGradient>
    <filter id="shadow-girl" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="3" stdDeviation="3" flood-opacity="0.25" />
    </filter>
  </defs>

  <!-- Background -->
  <circle cx="60" cy="60" r="56" fill="url(#bg-girl)" />
  <circle cx="60" cy="60" r="54" fill="none" stroke="#f472b6" stroke-width="2" stroke-opacity="0.4" />

  <!-- Hair Buns (Back) -->
  <circle cx="34" cy="38" r="10" fill="url(#hair-girl)" />
  <circle cx="86" cy="38" r="10" fill="url(#hair-girl)" />
  <circle cx="34" cy="38" r="5" fill="#f43f5e" opacity="0.7" />
  <circle cx="86" cy="38" r="5" fill="#f43f5e" opacity="0.7" />

  <!-- Clothes -->
  <path d="M 28 112 C 30 88, 44 82, 60 82 C 76 82, 90 88, 92 112 Z" fill="#7c3aed" filter="url(#shadow-girl)" />
  <path d="M 52 82 L 60 94 L 68 82 Z" fill="#fed7aa" />
  <circle cx="60" cy="99" r="2.5" fill="#fbcfe8" />

  <!-- Neck & Face -->
  <rect x="54" y="70" width="12" height="14" fill="#fde2d1" />
  <ellipse cx="60" cy="54" rx="22" ry="23" fill="#fde2d1" />

  <!-- Ears -->
  <circle cx="38" cy="55" r="4.5" fill="#fde2d1" />
  <circle cx="82" cy="55" r="4.5" fill="#fde2d1" />

  <!-- Hair Front & Bangs -->
  <path d="M 37 48 C 36 30, 48 22, 60 22 C 72 22, 84 30, 83 48 C 82 58, 80 66, 80 70 C 76 68, 77 56, 76 52 C 70 42, 64 42, 60 44 C 55 42, 49 42, 44 52 C 43 56, 44 68, 40 70 C 40 66, 38 58, 37 48 Z" fill="url(#hair-girl)" />

  <!-- Hair Clip (Code Star) -->
  <path d="M 42 34 L 46 36 L 43 40 L 39 37 Z" fill="#fbbf24" />
  <circle cx="43" cy="36" r="2" fill="#fff" />

  <!-- Blushing Cheeks -->
  <ellipse cx="47" cy="62" rx="4" ry="2.2" fill="#f43f5e" opacity="0.55" />
  <ellipse cx="73" cy="62" rx="4" ry="2.2" fill="#f43f5e" opacity="0.55" />

  <!-- Cute Big Anime Eyes -->
  <ellipse cx="49" cy="54" rx="3.8" ry="5" fill="#1e1b4b" />
  <ellipse cx="71" cy="54" rx="3.8" ry="5" fill="#1e1b4b" />
  <circle cx="48" cy="52" r="1.8" fill="#ffffff" />
  <circle cx="50.5" cy="56" r="0.8" fill="#ffffff" />
  <circle cx="70" cy="52" r="1.8" fill="#ffffff" />
  <circle cx="72.5" cy="56" r="0.8" fill="#ffffff" />

  <!-- Eyelashes -->
  <path d="M 45 49 Q 50 46 54 49" fill="none" stroke="#1e1b4b" stroke-width="1.8" stroke-linecap="round" />
  <path d="M 66 49 Q 70 46 75 49" fill="none" stroke="#1e1b4b" stroke-width="1.8" stroke-linecap="round" />

  <!-- Sweet Smile -->
  <path d="M 57 65 Q 60 68 63 65" fill="none" stroke="#9f1239" stroke-width="2" stroke-linecap="round" />

  <!-- Cat-ear Headset -->
  <path d="M 37 48 C 36 32, 84 32, 83 48" fill="none" stroke="#f472b6" stroke-width="3" stroke-linecap="round" />
  <rect x="34" y="47" width="5" height="10" rx="2" fill="#ec4899" />
  <rect x="81" y="47" width="5" height="10" rx="2" fill="#ec4899" />
</svg>'''

# 3. 极客猫猫 (Cyber Kitty)
SVG_CAT_HACKER = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <linearGradient id="bg-cat" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f59e0b" />
      <stop offset="100%" stop-color="#ef4444" />
    </linearGradient>
    <linearGradient id="visor-cat" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#10b981" />
      <stop offset="50%" stop-color="#06b6d4" />
      <stop offset="100%" stop-color="#3b82f6" />
    </linearGradient>
    <filter id="shadow-cat" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="3" stdDeviation="3" flood-opacity="0.25" />
    </filter>
  </defs>

  <!-- Background -->
  <circle cx="60" cy="60" r="56" fill="url(#bg-cat)" />
  <circle cx="60" cy="60" r="54" fill="none" stroke="#fbbf24" stroke-width="2" stroke-opacity="0.4" />

  <!-- Cat Ears -->
  <polygon points="34,44 44,18 56,36" fill="#ffffff" filter="url(#shadow-cat)" />
  <polygon points="38,40 44,24 52,36" fill="#f472b6" />
  <polygon points="86,44 76,18 64,36" fill="#ffffff" filter="url(#shadow-cat)" />
  <polygon points="82,40 76,24 68,36" fill="#f472b6" />

  <!-- Body / Hoodie -->
  <path d="M 28 112 C 30 86, 44 80, 60 80 C 76 80, 90 86, 92 112 Z" fill="#18181b" filter="url(#shadow-cat)" />
  <path d="M 52 82 L 60 92 L 68 82 Z" fill="#22c55e" />

  <!-- Cat Head -->
  <ellipse cx="60" cy="56" rx="27" ry="24" fill="#ffffff" filter="url(#shadow-cat)" />

  <!-- Orange fur patches -->
  <path d="M 38 42 C 45 42, 50 48, 50 54 C 42 54, 36 50, 38 42 Z" fill="#fb923c" />
  <path d="M 82 42 C 75 42, 70 48, 70 54 C 78 54, 84 50, 82 42 Z" fill="#38bdf8" />

  <!-- Cyber Visor / Sunglasses -->
  <rect x="36" y="48" width="48" height="15" rx="6" fill="url(#visor-cat)" stroke="#09090b" stroke-width="2" />
  <path d="M 42 52 L 54 52" stroke="#ffffff" stroke-width="2" stroke-linecap="round" opacity="0.8" />
  <text x="60" y="59" font-family="monospace" font-size="8" font-weight="bold" fill="#ffffff" text-anchor="middle">&lt;DEV/&gt;</text>

  <!-- Cute Nose & Mouth -->
  <polygon points="58,68 62,68 60,71" fill="#f43f5e" />
  <path d="M 56 72 Q 60 74 60 71 Q 60 74 64 72" fill="none" stroke="#3f3f46" stroke-width="1.8" stroke-linecap="round" />

  <!-- Whiskers -->
  <line x1="33" y1="68" x2="43" y2="69" stroke="#71717a" stroke-width="1.8" stroke-linecap="round" />
  <line x1="34" y1="73" x2="44" y2="72" stroke="#71717a" stroke-width="1.8" stroke-linecap="round" />
  <line x1="87" y1="68" x2="77" y2="69" stroke="#71717a" stroke-width="1.8" stroke-linecap="round" />
  <line x1="86" y1="73" x2="76" y2="72" stroke="#71717a" stroke-width="1.8" stroke-linecap="round" />

  <!-- Blush -->
  <ellipse cx="44" cy="67" rx="3" ry="1.5" fill="#fb7185" opacity="0.6" />
  <ellipse cx="76" cy="67" rx="3" ry="1.5" fill="#fb7185" opacity="0.6" />
</svg>'''

# 4. 赛博宇航员 (Space Geek / Astro)
SVG_ASTRO_GEEK = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <linearGradient id="bg-astro" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0ea5e9" />
      <stop offset="50%" stop-color="#4f46e5" />
      <stop offset="100%" stop-color="#1e1b4b" />
    </linearGradient>
    <linearGradient id="visor-astro" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f59e0b" />
      <stop offset="50%" stop-color="#fbbf24" />
      <stop offset="100%" stop-color="#06b6d4" />
    </linearGradient>
    <filter id="shadow-astro" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="3" stdDeviation="3" flood-opacity="0.3" />
    </filter>
  </defs>

  <!-- Background with Stars -->
  <circle cx="60" cy="60" r="56" fill="url(#bg-astro)" />
  <circle cx="28" cy="30" r="1.5" fill="#ffffff" opacity="0.7" />
  <circle cx="92" cy="28" r="1.2" fill="#ffffff" opacity="0.8" />
  <circle cx="85" cy="85" r="1" fill="#ffffff" opacity="0.6" />
  <circle cx="32" cy="88" r="1.2" fill="#ffffff" opacity="0.5" />

  <!-- Helmet Antenna -->
  <line x1="60" y1="22" x2="60" y2="15" stroke="#94a3b8" stroke-width="2.5" stroke-linecap="round" />
  <circle cx="60" cy="14" r="3.5" fill="#ef4444" />
  <circle cx="60" cy="14" r="1.5" fill="#ffffff" />

  <!-- Suit Body -->
  <path d="M 28 112 C 30 84, 42 78, 60 78 C 78 78, 90 84, 92 112 Z" fill="#f8fafc" filter="url(#shadow-astro)" />
  <!-- Chest Control Box -->
  <rect x="52" y="86" width="16" height="12" rx="3" fill="#0f172a" />
  <circle cx="56" cy="92" r="1.8" fill="#38bdf8" />
  <circle cx="64" cy="92" r="1.8" fill="#10b981" />

  <!-- Helmet Outer Ring -->
  <ellipse cx="60" cy="50" rx="27" ry="26" fill="#f8fafc" filter="url(#shadow-astro)" stroke="#cbd5e1" stroke-width="2" />

  <!-- Helmet Side Dials -->
  <rect x="30" y="46" width="5" height="10" rx="2" fill="#64748b" />
  <rect x="85" y="46" width="5" height="10" rx="2" fill="#64748b" />

  <!-- Helmet Visor -->
  <ellipse cx="60" cy="50" rx="21" ry="18" fill="url(#visor-astro)" stroke="#0f172a" stroke-width="2" />

  <!-- Visor Highlights & Star Reflection -->
  <path d="M 44 42 C 48 38, 56 36, 62 36 C 68 36, 74 38, 76 42 C 70 39, 58 39, 44 42 Z" fill="#ffffff" opacity="0.65" />
  <!-- Cute Digital Eyes on Visor -->
  <path d="M 48 51 Q 52 47 56 51" fill="none" stroke="#0f172a" stroke-width="2.5" stroke-linecap="round" />
  <path d="M 64 51 Q 68 47 72 51" fill="none" stroke="#0f172a" stroke-width="2.5" stroke-linecap="round" />
  <circle cx="52" cy="55" r="1.5" fill="#f43f5e" opacity="0.6" />
  <circle cx="68" cy="55" r="1.5" fill="#f43f5e" opacity="0.6" />
</svg>'''

# 5. 智研机器人 (CScope AI Bot)
SVG_ROBOT_AI = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <linearGradient id="bg-robot" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#06b6d4" />
      <stop offset="100%" stop-color="#0284c7" />
    </linearGradient>
    <linearGradient id="face-screen" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#1e293b" />
    </linearGradient>
    <filter id="shadow-bot" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="3" stdDeviation="3" flood-opacity="0.25" />
    </filter>
  </defs>

  <!-- Background -->
  <circle cx="60" cy="60" r="56" fill="url(#bg-robot)" />
  <circle cx="60" cy="60" r="54" fill="none" stroke="#67e8f9" stroke-width="2" stroke-opacity="0.4" />

  <!-- Antenna -->
  <line x1="60" y1="25" x2="60" y2="16" stroke="#94a3b8" stroke-width="3" stroke-linecap="round" />
  <circle cx="60" cy="15" r="4.5" fill="#38bdf8" />
  <circle cx="60" cy="15" r="2" fill="#ffffff" />

  <!-- Robot Body -->
  <path d="M 32 112 C 34 88, 44 84, 60 84 C 76 84, 86 88, 88 112 Z" fill="#f8fafc" filter="url(#shadow-bot)" />
  <rect x="52" y="92" width="16" height="8" rx="2" fill="#0284c7" />
  <circle cx="56" cy="96" r="1.5" fill="#38bdf8" />
  <circle cx="64" cy="96" r="1.5" fill="#22c55e" />

  <!-- Robot Ears -->
  <rect x="29" y="47" width="6" height="12" rx="3" fill="#64748b" />
  <rect x="85" y="47" width="6" height="12" rx="3" fill="#64748b" />

  <!-- Head Base -->
  <rect x="33" y="26" width="54" height="48" rx="16" fill="#f8fafc" filter="url(#shadow-bot)" stroke="#cbd5e1" stroke-width="1.5" />

  <!-- Dark Visor Screen -->
  <rect x="38" y="32" width="44" height="36" rx="10" fill="url(#face-screen)" />

  <!-- LED Expressive Eyes (^ _ ^) -->
  <path d="M 45 48 L 49 43 L 53 48" fill="none" stroke="#38bdf8" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
  <path d="M 67 48 L 71 43 L 75 48" fill="none" stroke="#38bdf8" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />

  <!-- Blushing LED Dots -->
  <circle cx="44" cy="56" r="2.2" fill="#f43f5e" opacity="0.8" />
  <circle cx="76" cy="56" r="2.2" fill="#f43f5e" opacity="0.8" />

  <!-- Digital Smile -->
  <path d="M 56 56 Q 60 60 64 56" fill="none" stroke="#22c55e" stroke-width="2.2" stroke-linecap="round" />
</svg>'''

# 6. 智慧狐狸 (Scholar Fox)
SVG_FOX_SCHOLAR = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <linearGradient id="bg-fox" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fb923c" />
      <stop offset="100%" stop-color="#ea580c" />
    </linearGradient>
    <linearGradient id="fur-fox" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#f97316" />
      <stop offset="100%" stop-color="#c2410c" />
    </linearGradient>
    <filter id="shadow-fox" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="3" stdDeviation="3" flood-opacity="0.25" />
    </filter>
  </defs>

  <!-- Background -->
  <circle cx="60" cy="60" r="56" fill="url(#bg-fox)" />
  <circle cx="60" cy="60" r="54" fill="none" stroke="#fed7aa" stroke-width="2" stroke-opacity="0.4" />

  <!-- Fox Ears -->
  <polygon points="34,46 38,18 56,36" fill="url(#fur-fox)" filter="url(#shadow-fox)" />
  <polygon points="38,40 42,24 52,36" fill="#fef3c7" />
  <polygon points="86,46 82,18 64,36" fill="url(#fur-fox)" filter="url(#shadow-fox)" />
  <polygon points="82,40 78,24 68,36" fill="#fef3c7" />

  <!-- Graduation Cap -->
  <polygon points="60,18 80,25 60,32 40,25" fill="#1e1b4b" filter="url(#shadow-fox)" />
  <rect x="52" y="27" width="16" height="6" fill="#0f172a" />
  <circle cx="60" cy="25" r="2" fill="#fbbf24" />
  <line x1="60" y1="25" x2="76" y2="33" stroke="#fbbf24" stroke-width="1.8" />
  <circle cx="76" cy="34" r="1.8" fill="#fbbf24" />

  <!-- Body -->
  <path d="M 30 112 C 32 88, 44 82, 60 82 C 76 82, 88 88, 90 112 Z" fill="#0f172a" filter="url(#shadow-fox)" />
  <!-- Bow Tie -->
  <polygon points="54,84 66,90 54,90" fill="#dc2626" />
  <polygon points="66,84 54,90 66,90" fill="#dc2626" />
  <circle cx="60" cy="87" r="2" fill="#ef4444" />

  <!-- Head Base -->
  <ellipse cx="60" cy="56" rx="25" ry="22" fill="url(#fur-fox)" filter="url(#shadow-fox)" />

  <!-- White Cheeks / Muzzle -->
  <path d="M 40 54 C 44 68, 56 74, 60 74 C 64 74, 76 68, 80 54 C 76 60, 68 64, 60 64 C 52 64, 44 60, 40 54 Z" fill="#ffffff" />

  <!-- Smart Scholar Glasses -->
  <circle cx="49" cy="52" r="7.5" fill="#e0f2fe" fill-opacity="0.3" stroke="#1e293b" stroke-width="2" />
  <circle cx="71" cy="52" r="7.5" fill="#e0f2fe" fill-opacity="0.3" stroke="#1e293b" stroke-width="2" />
  <line x1="56.5" y1="52" x2="63.5" y2="52" stroke="#1e293b" stroke-width="2" />

  <!-- Clever Eyes -->
  <ellipse cx="49" cy="52" rx="2.5" ry="3.5" fill="#0f172a" />
  <circle cx="48" cy="50" r="1" fill="#ffffff" />
  <ellipse cx="71" cy="52" rx="2.5" ry="3.5" fill="#0f172a" />
  <circle cx="70" cy="50" r="1" fill="#ffffff" />

  <!-- Nose & Smile -->
  <ellipse cx="60" cy="65" rx="2.5" ry="1.8" fill="#0f172a" />
  <path d="M 57 68 Q 60 71 63 68" fill="none" stroke="#0f172a" stroke-width="1.8" stroke-linecap="round" />
</svg>'''

# 7. 架构国宝 (Panda Developer)
SVG_PANDA_DEV = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <linearGradient id="bg-panda" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#10b981" />
      <stop offset="100%" stop-color="#047857" />
    </linearGradient>
    <filter id="shadow-panda" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="3" stdDeviation="3" flood-opacity="0.25" />
    </filter>
  </defs>

  <!-- Background -->
  <circle cx="60" cy="60" r="56" fill="url(#bg-panda)" />
  <circle cx="60" cy="60" r="54" fill="none" stroke="#6ee7b7" stroke-width="2" stroke-opacity="0.4" />

  <!-- Panda Ears -->
  <circle cx="37" cy="34" r="9" fill="#18181b" filter="url(#shadow-panda)" />
  <circle cx="83" cy="34" r="9" fill="#18181b" filter="url(#shadow-panda)" />

  <!-- Gamer Headset band -->
  <path d="M 37 40 C 37 20, 83 20, 83 40" fill="none" stroke="#fbbf24" stroke-width="3.5" stroke-linecap="round" />
  <rect x="33" y="38" width="6" height="12" rx="3" fill="#f59e0b" />
  <rect x="81" y="38" width="6" height="12" rx="3" fill="#f59e0b" />

  <!-- Body / Dev Hoodie -->
  <path d="M 28 112 C 30 86, 44 80, 60 80 C 76 80, 90 86, 92 112 Z" fill="#18181b" filter="url(#shadow-panda)" />
  <text x="60" y="98" font-family="monospace" font-size="9" font-weight="bold" fill="#34d399" text-anchor="middle">{ ; }</text>

  <!-- Panda Head -->
  <ellipse cx="60" cy="56" rx="26" ry="24" fill="#ffffff" filter="url(#shadow-panda)" />

  <!-- Panda Black Eye Patches -->
  <ellipse cx="48" cy="52" rx="7" ry="9" fill="#18181b" transform="rotate(-15 48 52)" />
  <ellipse cx="72" cy="52" rx="7" ry="9" fill="#18181b" transform="rotate(15 72 52)" />

  <!-- Cute Eyes inside Patches -->
  <circle cx="48" cy="52" r="3" fill="#ffffff" />
  <circle cx="49" cy="52" r="2" fill="#0f172a" />
  <circle cx="49.5" cy="51" r="0.8" fill="#ffffff" />

  <circle cx="72" cy="52" r="3" fill="#ffffff" />
  <circle cx="71" cy="52" r="2" fill="#0f172a" />
  <circle cx="70.5" cy="51" r="0.8" fill="#ffffff" />

  <!-- Cheeks Blush -->
  <ellipse cx="41" cy="63" rx="3.5" ry="2" fill="#fb7185" opacity="0.6" />
  <ellipse cx="79" cy="63" rx="3.5" ry="2" fill="#fb7185" opacity="0.6" />

  <!-- Panda Nose & Happy Mouth -->
  <ellipse cx="60" cy="63" rx="3.5" ry="2.2" fill="#18181b" />
  <path d="M 56 67 Q 60 70 64 67" fill="none" stroke="#18181b" stroke-width="1.8" stroke-linecap="round" />
</svg>'''

# 8. 算法法师 (Code Wizard)
SVG_WIZARD_CODER = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <linearGradient id="bg-wiz" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#8b5cf6" />
      <stop offset="100%" stop-color="#4c1d95" />
    </linearGradient>
    <linearGradient id="robe-wiz" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#312e81" />
      <stop offset="100%" stop-color="#1e1b4b" />
    </linearGradient>
    <filter id="shadow-wiz" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="3" stdDeviation="3" flood-opacity="0.3" />
    </filter>
  </defs>

  <!-- Background -->
  <circle cx="60" cy="60" r="56" fill="url(#bg-wiz)" />
  <circle cx="60" cy="60" r="54" fill="none" stroke="#c084fc" stroke-width="2" stroke-opacity="0.4" />

  <!-- Magic Sparkles -->
  <circle cx="28" cy="40" r="1.5" fill="#fef08a" />
  <circle cx="94" cy="48" r="1.5" fill="#fef08a" />
  <circle cx="88" cy="85" r="2" fill="#38bdf8" />

  <!-- Wizard Hat Cone -->
  <path d="M 60 12 L 82 38 L 38 38 Z" fill="#1e1b4b" filter="url(#shadow-wiz)" />
  <ellipse cx="60" cy="38" rx="27" ry="7" fill="#312e81" filter="url(#shadow-wiz)" />
  <!-- Hat Band & Buckle -->
  <ellipse cx="60" cy="36" rx="18" ry="4" fill="#fbbf24" />
  <circle cx="60" cy="36" r="3" fill="#e11d48" />
  <!-- Star on Hat -->
  <polygon points="60,22 62,26 66,26 63,28 64,32 60,30 56,32 57,28 54,26 58,26" fill="#fef08a" />

  <!-- Body / Robe -->
  <path d="M 28 112 C 30 88, 44 82, 60 82 C 76 82, 90 88, 92 112 Z" fill="url(#robe-wiz)" filter="url(#shadow-wiz)" />
  <path d="M 52 82 L 60 96 L 68 82 Z" fill="#c084fc" />

  <!-- Head / Face -->
  <ellipse cx="60" cy="56" rx="22" ry="21" fill="#fed7aa" />

  <!-- Silver Hair -->
  <path d="M 38 48 C 36 38, 46 36, 60 36 C 74 36, 84 38, 82 48 C 82 56, 80 62, 79 66 C 75 62, 76 54, 75 50 C 70 45, 64 45, 60 46 C 56 45, 50 45, 45 50 C 44 54, 45 62, 41 66 C 40 62, 38 56, 38 48 Z" fill="#e2e8f0" />

  <!-- Tech Monocle on Right Eye -->
  <circle cx="68" cy="54" r="6" fill="#06b6d4" fill-opacity="0.35" stroke="#fbbf24" stroke-width="1.8" />
  <line x1="74" y1="54" x2="80" y2="56" stroke="#fbbf24" stroke-width="1.5" />

  <!-- Eyes -->
  <circle cx="51" cy="54" r="2.8" fill="#1e1b4b" />
  <circle cx="52" cy="53" r="1" fill="#ffffff" />
  <circle cx="68" cy="54" r="2.8" fill="#0284c7" />
  <circle cx="69" cy="53" r="1" fill="#ffffff" />

  <!-- Smile -->
  <path d="M 57 65 Q 60 68 63 65" fill="none" stroke="#0f172a" stroke-width="1.8" stroke-linecap="round" />

  <!-- Floating Crystal Orb -->
  <circle cx="34" cy="80" r="6" fill="#38bdf8" filter="url(#shadow-wiz)" />
  <circle cx="33" cy="78" r="2" fill="#ffffff" opacity="0.8" />
</svg>'''

avatars = {
    'avatar_boy_geek.svg': SVG_BOY_GEEK,
    'avatar_girl_coder.svg': SVG_GIRL_CODER,
    'avatar_cat_hacker.svg': SVG_CAT_HACKER,
    'avatar_astro_geek.svg': SVG_ASTRO_GEEK,
    'avatar_robot_ai.svg': SVG_ROBOT_AI,
    'avatar_fox_scholar.svg': SVG_FOX_SCHOLAR,
    'avatar_panda_dev.svg': SVG_PANDA_DEV,
    'avatar_wizard_coder.svg': SVG_WIZARD_CODER,
}

for filename, content in avatars.items():
    filepath = os.path.join(AVATAR_DIR, filename)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content.strip())
    print(f"Generated: {filepath}")

print(f"Successfully generated {len(avatars)} cartoon avatars in {AVATAR_DIR}")
