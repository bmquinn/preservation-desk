import { invoke } from "@tauri-apps/api/tauri";
import { appWindow } from "@tauri-apps/api/window";
import JSConfetti from "js-confetti";

import audioSVG from "./assets/audio.svg";
import clipboardSVG from "./assets/clipboard.svg";
import directorySVG from "./assets/directory.svg";
import documentSVG from "./assets/document.svg";
import imageSVG from "./assets/image.svg";
import loadingAnimationSVG from "./assets/loading_animation.svg";
import videoSVG from "./assets/video.svg";

document.addEventListener("contextmenu", (event) => event.preventDefault());

const dropZone = document.getElementById("drop-zone");
const fileInfoEl = document.getElementById("file-info");

type StringObject = { [key: string]: string };

const jsConfetti = new JSConfetti();

appWindow.onFileDropEvent(async (event) => {
  if (event.payload.type === "hover" && dropZone) {
    dropZone.classList.remove("hidden");
  } else if (event.payload.type === "drop" && dropZone && fileInfoEl) {
    dropZone.classList.add("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });

    event.payload.paths.map(async (path) => {
      let card = document.createElement("div");
      card.setAttribute(
        "class",
        "relative h-full py-8 px-6 space-y-6 rounded-xl border border-gray-200 bg-white overflow-hidden z-0"
      );
      let deleteButton = document.createElement("button");
      deleteButton.setAttribute(
        "class",
        "absolute top-0 right-0 mt-3 mr-3 bg-gray-200 p-1 rounded-md shadow-sm inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
      );
      deleteButton.innerHTML = `<span class="sr-only">Close menu</span>
      <!-- Heroicon name: outline/x -->
      <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>`;
      deleteButton.addEventListener("click", function () {
        card.remove();
        if (fileInfoEl.childNodes.length === 0) {
          dropZone.classList.remove("hidden");
        }
      });
      card.append(deleteButton);
      let cardHeader = document.createElement("div");
      cardHeader.classList.add("card-header");
      let cardIcon = document.createElement("img");
      cardIcon.setAttribute("class", "w-1/4 mx-auto shadow-lg");
      cardIcon.setAttribute("src", documentSVG);
      cardHeader.prepend(cardIcon);
      card.appendChild(cardHeader);
      let cardDetails = document.createElement("div");
      cardDetails.classList.add("border", "border-radius", "border-gray-200");
      card.appendChild(cardDetails);
      let cardDetailsDL = document.createElement("dl");
      cardDetails.appendChild(cardDetailsDL);
      fileInfoEl.prepend(card);

      await invoke("file_info", { path: path })
        .then(({ is_dir, ...fileInfo }: any) => {
          const svg =
            is_dir == "true" ? directorySVG : mimeSVG(fileInfo["mime_type"]);
          cardIcon.setAttribute("src", svg);
          const fileInfoElements = generateFileInfoDetails({
            file: path,
            ...fileInfo,
          });
          cardDetailsDL.innerHTML += fileInfoElements;
        })
        .catch((error) => {
          cardDetails.innerHTML = generateError(error);
        });

      let div = document.createElement("div");
      div.setAttribute(
        "class",
        "bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6"
      );
      let dt = document.createElement("dt");
      dt.classList.add("text-sm", "font-medium", "text-gray-500");
      dt.innerText = "checksums";
      cardDetailsDL.appendChild(div);
      let dd = document.createElement("dd");
      dd.setAttribute(
        "class",
        "mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0"
      );
      div.appendChild(dt);
      div.appendChild(dd);
      let ul = document.createElement("ul");
      ul.setAttribute(
        "class",
        "bg-white divide-y divide-gray-200 rounded-md border border-gray-200"
      );
      ul.innerHTML = loadingAnimation();
      dd.appendChild(ul);

      await invoke("checksum", { path: path })
        .then((checksums: any) => {
          ul.innerHTML = "";
          generateChecksumDetails(checksums, ul);
        })
        .catch((error) => {
          cardDetails.innerHTML = generateError(error);
        });
    });
  } else {
    dropZone?.classList.add("hidden");
  }
});

function humanFileSize(size: string): string {
  const sizeNum = parseInt(size);
  var i = sizeNum == 0 ? 0 : Math.floor(Math.log(sizeNum) / Math.log(1024));
  return (
    Number((sizeNum / Math.pow(1024, i)).toFixed(2)) * 1 +
    " " +
    ["B", "kB", "MB", "GB", "TB"][i]
  );
}

function mimeSVG(mimeType: string): string {
  const mapping = {
    audio: audioSVG,
    image: imageSVG,
    video: videoSVG,
    default: documentSVG,
  };

  const candidate = Object.entries(mapping).find(([k]) =>
    mimeType.startsWith(k)
  );

  if (candidate === undefined) {
    return mapping["default"];
  } else {
    return candidate[1];
  }
}

function generateError(error: string): string {
  return `
    <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
      <dt class="text-sm font-medium text-red-500">Error</dt>
      <dd class="mt-1 text-sm text-gray-600 italic sm:col-span-2 sm:mt-0">${error}</dd>  
    </div>
  `;
}

function generateFileInfoDetails(fileInfo: StringObject): string {
  let el = "";
  let index = 0;
  if (fileInfo) {
    for (const [fileInfoType, fileInfoValue] of Object.entries(fileInfo)) {
      const backgroundClass = index % 2 === 0 ? "bg-gray-50" : "bg-white";
      el += `
      <div class="${backgroundClass} px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
        <dt class="text-sm font-medium text-gray-500">${fileInfoType.replace(
          /(_)+/g,
          " "
        )}</dt>
        <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0 break-words">${
          fileInfoType == "size" ? humanFileSize(fileInfoValue) : fileInfoValue
        }</dd>
      </div>
    `;
      index++;
    }
    return el;
  } else {
    return "";
  }
}

function generateChecksumDetails(hashes: StringObject, ul: HTMLElement): void {
  if (hashes) {
    for (const [hashType, hashValue] of Object.entries(hashes)) {
      let li = document.createElement("li");
      li.setAttribute(
        "class",
        "flex items-center justify-between py-3 pl-3 pr-4 text-sm"
      );
      let hashDiv = document.createElement("div");
      hashDiv.classList.add("flex", "w-0", "flex-1", "items-center");
      hashDiv.innerHTML = `
      <span class="ml-2 w-0 flex-1 break-words"><strong>${hashType}:</strong> ${hashValue}</span>
      `;
      li.appendChild(hashDiv);
      let clipboardDiv = document.createElement("div");
      let button = document.createElement("button");
      button.innerHTML = `<img class="w-6 h-6" src="${clipboardSVG}" />`;
      button.addEventListener(
        "click",
        function () {
          copyToClipboard(hashValue);
        },
        false
      );
      clipboardDiv.appendChild(button);
      li.appendChild(clipboardDiv);
      ul.appendChild(li);
    }
  } else {
    return;
  }
}

async function copyToClipboard(content: string) {
  jsConfetti.addConfetti({ emojis: ["📋"], emojiSize: 30, confettiNumber: 60 });
  await navigator.clipboard.writeText(content);
  let message = `${content} copied to clipboard`;
  console.log(message);
}

function loadingAnimation(): string {
  return `
    <div class="flex items-center justify-center">
      <img class="h-10" src="${loadingAnimationSVG}" />              
    <div>
  `;
}
