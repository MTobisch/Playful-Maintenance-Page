# Playful Maintenance Page

![maintenance_page_preview_600](https://github.com/user-attachments/assets/51e7c993-4dc6-4996-8198-1af1f144270b)

This is a simple, domain-agnostic maintenance page that can be used as drop-in for most web projects.

It provides some fun little interactivity when moving the mouse around and clicking the screen. This hopefully proves entertaining enough that visitors are distracted a bit from the fact that the site is currently unavailable.

Part of its design is that it consists of a **single** HTML file that can be easily forwarded to by a reverse proxy or similar. You can can check out [a live preview](https://mtobisch.github.io/playful-maintenance-page/dist/) here.

# How to use

Simply [download the finished HTML file](https://github.com/MTobisch/playful-maintenance-page/blob/main/dist/index.html) and put it where you need it.

The project uses a permissive **CC license**, so you are free to use and modify it however you like.

# Building

If you wish to modify the page in a non-trivial manner, make sure npm/node is available on your system and all dependencies are installed with

```sh
npm install
```

You can then build the HTML file with

```sh
npm run build
```

It will then be placed in the `./dist` folder.

Alternatively, you can also start the dev server with

```sh
npm run dev
```

# License

CC0-1.0 license

This means the project lives in the Public Domain and you can copy or modify it for any purpose without needing special copyright attribution.
