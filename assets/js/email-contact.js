(() => {
    const contactSelector = ".email-contact";
    const copySelector = "[data-copy-email]";

    async function copyEmail(email) {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(email);
            return;
        }

        const textArea = document.createElement("textarea");
        textArea.value = email;
        textArea.setAttribute("readonly", "");
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.select();

        const copied = document.execCommand("copy");
        textArea.remove();

        if (!copied) {
            throw new Error("Copy command failed");
        }
    }

    document.addEventListener("click", async (event) => {
        const copyButton = event.target.closest(copySelector);

        if (copyButton) {
            const contact = copyButton.closest(contactSelector);
            const status = contact?.querySelector("[data-email-status]");
            const originalLabel = copyButton.textContent;

            try {
                await copyEmail(copyButton.dataset.copyEmail);
                copyButton.textContent = "Copied";
                if (status) {
                    status.textContent = "Email address copied.";
                }
            } catch {
                if (status) {
                    status.textContent = "Copy failed. Select the address above.";
                }
            }

            window.clearTimeout(copyButton.emailCopyTimer);
            copyButton.emailCopyTimer = window.setTimeout(() => {
                copyButton.textContent = originalLabel;
                if (status) {
                    status.textContent = "";
                }
            }, 2500);
            return;
        }

        document.querySelectorAll(`${contactSelector}[open]`).forEach((contact) => {
            if (!contact.contains(event.target)) {
                contact.removeAttribute("open");
            }
        });
    });

    document.addEventListener("keydown", (event) => {
        if (event.key !== "Escape") {
            return;
        }

        document.querySelectorAll(`${contactSelector}[open]`).forEach((contact) => {
            contact.removeAttribute("open");
            contact.querySelector("summary")?.focus();
        });
    });
})();
