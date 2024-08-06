const dropZone = document.getElementById('drop-zone');
const dropZoneContent = document.getElementById('drop-zone-content');
const fileInput = document.getElementById('file-input');

const imagePurpose = document.getElementById('image-purpose');
const imageStage = document.getElementById('image-stage');

let fileIds = [];

dropZone.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', function (e) {
    uploadFiles(e.target.files);
});

dropZone.addEventListener('dragover', function (e) {
    e.stopPropagation();
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    dropZoneContent.classList.add('animate-pulse');
});

dropZone.addEventListener('dragleave', function (e) {
    e.stopPropagation();
    e.preventDefault();
    dropZoneContent.classList.remove('animate-pulse');
});

dropZone.addEventListener('drop', function (e) {
    e.stopPropagation();
    e.preventDefault();

    uploadFiles(e.dataTransfer.files);
    dropZoneContent.classList.remove('animate-pulse');
});

async function uploadFiles(files) {
    showUploadModal();

    let data = new FormData();
    const file = files[0];
    data.append('file', file);

    showUploadModal(file.name);

    try {
        const res = await fetch('/api/upload', {
            method: 'POST',
            body: data,
        });

        const statusCode = res.status;
        const json = await res.json();

        if (statusCode !== 200) {
            showErrorModal(statusCode, json.error);
            return;
        }

        const fileId = json.id;
        fileIds.push(fileId);

        imagePurpose.innerText = fileIds.length == 1 ? 'Preview' : 'Focus/Primary';
        imageStage.innerText = fileIds.length == 1 ? '2/3' : '3/3';

        if (fileIds.length == 3) {
            publishImages();
        } else {
            hideUploadModal();
        }
    } catch (e) {
    }
}

async function publishImages() {
    try {
        const res = await fetch('/api/publish', {
            method: 'POST',
            body: JSON.stringify({
                files: fileIds,
            }),
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const statusCode = res.status;
        const json = await res.json();

        if (statusCode !== 200) {
            showErrorModal(statusCode, json.error);
            return;
        }

        const viewId = json.id;

        showFinalModal(viewId);

        fileIds = [];
        imagePurpose.innerText = 'Preview';
        imageStage.innerText = '1/3';
    } catch (e) {
    }
}

let modalContainer = document.getElementById('modal-container');
let modal = document.getElementById('modal');
let previewTime, previewData, imgLoadTimeout;
let modalOpenTime;
let modalCloseTime;

let modal_name;
let modalDismissable;

function showUploadModal(file) {
    showModal();
    modalDismissable = false;

    modal.innerHTML = `
            <div class="flex justify-between flex-wrap">
                <span class="-mt-2">
                    <h4 id="upload-title" class="text-md text-[#878289]">Uploading...</h4>
                    <h4 id="upload-file" class="text-2xl font-semibold text-text">${file}</h4>
                    <p id="upload-subtitle" class="text-sm text-[#878289]">
                        Please be patient...
                    </p>
                </span>
            </div>
    
            <div class="la-ball-climbing-dot la-2x">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
            </div>`;
}

function hideUploadModal() {
    const climbingBall = document.querySelector('.la-ball-climbing-dot');
    const uploadTitle = document.getElementById('upload-title');
    const uploadSubtitle = document.getElementById('upload-subtitle');

    uploadTitle.innerText = "Sucess!";
    uploadSubtitle.innerText = "Image uploaded successfully!";

    climbingBall.classList.add('translate-x-1/2', 'opacity-0', 'blur-md', 'duration-300', 'scale-125', '-rotate-90');

    setTimeout(() => {
        climbingBall.classList.remove('duration-300', '-rotate-90');
        climbingBall.classList.add("flex", "justify-center", "items-center", 'rotate-90')
        climbingBall.innerHTML = `
            <svg width="42" height="30" viewBox="0 0 13 10" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g filter="url(#filter0_i_191_800)">
                <path d="M11.8967 2.6718C12.3523 2.21619 12.3523 1.4775 11.8967 1.02188C11.441 0.566273 10.7024 0.566273 10.2467 1.02188L4.76597 6.50265L1.99163 3.7283C1.53601 3.27269 0.797321 3.27269 0.341709 3.7283C-0.113902 4.18392 -0.113904 4.92261 0.341708 5.37822L3.91727 8.95378C3.92494 8.96189 3.93274 8.96992 3.94068 8.97786C4.14357 9.18075 4.4026 9.29329 4.66776 9.31548C4.67681 9.31624 4.68587 9.31689 4.69493 9.31744C5.01684 9.33707 5.34534 9.2239 5.59132 8.97791C5.59986 8.96937 5.60825 8.96072 5.61647 8.95198L11.8967 2.6718Z" fill="#12B76A" />
            </g>
            <defs>
                <filter id="filter0_i_191_800" x="0" y="0.680176" width="12.2383" height="9.22274" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                <feFlood flood-opacity="0" result="BackgroundImageFix" />
                <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                <feOffset dy="0.583333" />
                <feGaussianBlur stdDeviation="0.291667" />
                <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
                <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.4 0" />
                <feBlend mode="normal" in2="shape" result="effect1_innerShadow_191_800" />
                </filter>
            </defs>
            </svg>;`

        setTimeout(() => {
            climbingBall.classList.add('duration-300');
            climbingBall.classList.remove('translate-x-1/2', 'opacity-0', 'blur-md', 'scale-125', 'rotate-90');

            setTimeout(() => {
                hideModal();
            }, 750);
        }, 0);
    }, 300);
}

function showFinalModal(viewId) {
    showModal();

    modal.innerHTML = `
            <div class="flex justify-between flex-wrap cursor-pointer" onclick="navigator.clipboard.writeText('${window.location.origin}/view/${viewId}'); document.getElementById('upload-file').innerText = 'Copied!'; hideModal()">
                <span class="-mt-2">
                    <h4 id="upload-title" class="text-md text-[#878289]">Success!</h4>
                    <h4 id="upload-file" class="text-2xl font-semibold text-text">Click to copy!</h4>
                    <p id="upload-subtitle" class="text-sm text-[#878289]">
                        Click outside to dismiss
                    </p>
                </span>
            </div>`;

    
}

function showErrorModal(code, error) {
    modalDismissable = true;

    modal.innerHTML = `
            <div class="flex justify-between flex-wrap">
                <span class="-mt-2">
                    <h4 id="upload-title" class="text-md text-[#878289]">${code}</h4>
                    <h4 id="upload-file" class="text-2xl font-semibold text-text">${error}</h4>
                    <p id="upload-subtitle" class="text-sm text-[#878289]">
                        Click outside to dismiss
                    </p>
                </span>
            </div>
    
            <svg class="-translate-x-1/4" width="42px" height="42px" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--twemoji" preserveAspectRatio="xMidYMid meet"><path fill="#DD2E44" d="M21.533 18.002L33.768 5.768a2.5 2.5 0 0 0-3.535-3.535L17.998 14.467L5.764 2.233a2.498 2.498 0 0 0-3.535 0a2.498 2.498 0 0 0 0 3.535l12.234 12.234L2.201 30.265a2.498 2.498 0 0 0 1.768 4.267c.64 0 1.28-.244 1.768-.732l12.262-12.263l12.234 12.234a2.493 2.493 0 0 0 1.768.732a2.5 2.5 0 0 0 1.768-4.267L21.533 18.002z"/></svg>`;
}

function hideModal(instant = false) {
    modalContainer = document.getElementById('modal-container');

    if (!modalContainer) {
        return setTimeout(() => {
            hideModal();
        }, 25);
    }

    modal = document.getElementById('modal');

    modalCloseTime = Date.now();

    if (instant) modalCloseTime -= 750;

    modalContainer.classList.remove("backdrop-brightness-75", "backdrop-saturate-50", "backdrop-blur-md")
    modal.classList.add("scale-50", "opacity-0", "blur-lg", "translate-y-6")

    setTimeout(() => {
        modalContainer.classList.add("opacity-0");
        setTimeout(() => {
            modalContainer.classList.add("hidden");
        }, instant ? 0 : 100);
    }, instant ? 0 : 100);
}

function showModal() {
    modalDismissable = true;

    modalContainer = document.getElementById('modal-container');
    modal = document.getElementById('modal');

    modalContainer.addEventListener('click', (e) => {
        const timePassed = Date.now() > (modalOpenTime + 450);
        if (e.target === modalContainer && timePassed && modalDismissable) hideModal();
    })

    modalOpenTime = Date.now();
    modalContainer.classList.remove("hidden");

    setTimeout(() => {
        modalContainer.classList.add("backdrop-brightness-75", "backdrop-saturate-50", "backdrop-blur-md")
        modalContainer.classList.remove("opacity-0");

        setTimeout(() => {
            modal.classList.remove("scale-50", "opacity-0", "blur-lg", "translate-y-6")

        }, 200)
    }, 0)
}

hideModal(true);