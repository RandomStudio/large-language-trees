const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

/**
 * Convertit un fichier WebP en PNG.
 * @param {string} inputPath - Chemin du fichier WebP.
 */
async function convertWebPToPNG(inputPath) {
    try {
        const outputPath = path.format({
            ...path.parse(inputPath),
            base: undefined, // Pour ne pas garder l'ancien base name
            ext: '.png'
        });

        await sharp(inputPath)
            .toFormat('png')
            .toFile(outputPath);

        console.log(`Fichier converti et sauvegardé sous : ${outputPath}`);
    } catch (error) {
        console.error('Erreur lors de la conversion :', error);
    }
}

/**
 * Parcourt un dossier et convertit tous les fichiers WebP en PNG.
 * @param {string} directory - Chemin du dossier à parcourir.
 */
async function convertWebPFilesInDirectory(directory) {
    fs.readdir(directory, (err, files) => {
        if (err) {
            return console.error('Erreur lors de la lecture du dossier :', err);
        }

        files.forEach(file => {
            if (path.extname(file).toLowerCase() === '.webp') {
                const filePath = path.join(directory, file);
                convertWebPToPNG(filePath);
            }
        });
    });
}

// Modifier le chemin du dossier ci-dessous pour l'utiliser
convertWebPFilesInDirectory('../../static/plants');
