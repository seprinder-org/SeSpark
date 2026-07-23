/**
 * Build-time script to scan resources/profiles/ and generate
 * a compact printer profile index for the frontend.
 *
 * Usage: node scripts/generate-profile-index.js
 * Output: frontend/src/lib/profiles/profile-index.json
 */

const fs = require('fs');
const path = require('path');

const PROFILES_DIR = path.resolve(__dirname, '..', 'resources', 'profiles');
const OUTPUT_DIR = path.resolve(__dirname, '..', 'frontend', 'src', 'lib', 'profiles');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'profile-index.json');

// Brands that have subdirectories with machine/process/filament data
const BRANDS_WITH_SUBDIRS = new Set([
    'Phrozen', 'Voron', 'Voxelab', 'Vzbot', 'Wanhao France',
    'WEMAKE3D', 'WonderMaker', 'Afinia', 'Anker', 'Anycubic',
    'Artillery', 'BBL', 'BIQU', 'Blocks', 'Chuanying', 'Co Print',
    'CoLiDo', 'Comgrow', 'CONSTRUCT3D', 'Creality', 'Cubicon',
    'Custom', 'DeltaMaker', 'Dremel', 'Elegoo', 'Eryone',
    'Flashforge', 'FLSun', 'FlyingBear', 'Folgertech', 'Geeetech',
    'Ginger Additive', 'InfiMech', 'iQ', 'Kingroon', 'LH',
    'LONGER', 'Lulzbot', 'M3D', 'MagicMaker', 'Mellow',
    'OpenEYE', 'OrcaArena', 'Peopoly', 'Positron3D', 'Prusa',
    'Qidi', 'Raise3D', 'Ratrig', 're3D', 'RH3D', 'RolohaunDesign',
    'SecKit', 'SeeMeCNC', 'Snapmaker', 'Sovol', 'Tiertime',
    'Tronxy', 'TwoTrees', 'UltiMaker', 'Vivedino', 'Volumic',
    'Wanhao', 'Z-Bolt'
]);

function parseNozzleDiameters(str) {
    if (!str) return [0.4];
    return str.split(';').map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
}

function parseDefaultMaterials(str) {
    if (!str) return [];
    return str.split(';').map(s => s.trim()).filter(Boolean);
}

function findCoverImage(brandFolder) {
    // Look for *_cover.png files in the brand folder
    if (!fs.existsSync(brandFolder)) return null;
    const files = fs.readdirSync(brandFolder);
    const cover = files.find(f => /_cover\.(png|jpg|jpeg|svg)$/i.test(f));
    return cover || null;
}

function main() {
    console.log(`Scanning profiles in: ${PROFILES_DIR}`);

    if (!fs.existsSync(PROFILES_DIR)) {
        console.error(`ERROR: Profiles directory not found: ${PROFILES_DIR}`);
        process.exit(1);
    }

    const brandFiles = fs.readdirSync(PROFILES_DIR)
        .filter(f => f.endsWith('.json') && f !== 'blacklist.json' && f !== 'check_unused_setting_id.py' && f !== 'OrcaArena.json' && f !== 'OrcaFilamentLibrary.json');

    const printers = [];
    const brands = [];

    for (const brandFile of brandFiles) {
        const brandName = brandFile.replace(/\.json$/, '');
        const brandPath = path.join(PROFILES_DIR, brandFile);

        let brandData;
        try {
            brandData = JSON.parse(fs.readFileSync(brandPath, 'utf-8'));
        } catch (e) {
            console.warn(`  Skipping ${brandFile}: parse error`);
            continue;
        }

        const brandFolderName = brandData.name; // e.g. "Voron", "Creality"
        const brandFolder = path.join(PROFILES_DIR, brandFolderName);
        const hasSubdir = BRANDS_WITH_SUBDIRS.has(brandFolderName) && fs.existsSync(brandFolder);

        const coverImage = hasSubdir ? findCoverImage(brandFolder) : null;

        brands.push(brandData.name);

        if (!brandData.machine_model_list || brandData.machine_model_list.length === 0) {
            console.log(`  ${brandData.name}: no machine models listed`);
            continue;
        }

        for (const machineEntry of brandData.machine_model_list) {
            const machineName = machineEntry.name;
            const subPath = machineEntry.sub_path;

            // Try to load the machine JSON for detailed info
            let machineData = null;
            if (hasSubdir) {
                const machineFilePath = path.join(brandFolder, subPath);
                try {
                    machineData = JSON.parse(fs.readFileSync(machineFilePath, 'utf-8'));
                } catch (e) {
                    // Machine file may not exist; that's okay
                }
            }

            const nozzleDiameters = machineData
                ? parseNozzleDiameters(machineData.nozzle_diameter)
                : [0.4];

            const defaultMaterials = machineData
                ? parseDefaultMaterials(machineData.default_materials)
                : [];

            const printer = {
                id: `${brandData.name}::${machineName}`,
                brand: brandData.name,
                brand_description: brandData.description || '',
                machine_name: machineName,
                model_id: machineData?.model_id || '',
                nozzle_diameters: nozzleDiameters,
                family: machineData?.family || '',
                bed_model: machineData?.bed_model || '',
                bed_texture: machineData?.bed_texture || '',
                hotend_model: machineData?.hotend_model || '',
                default_materials: defaultMaterials,
                machine_path: hasSubdir ? `${brandFolderName}/${subPath}` : '',
                brand_folder: hasSubdir ? brandFolderName : '',
                cover_image: coverImage,
            };

            printers.push(printer);
        }

        console.log(`  ${brandData.name}: ${brandData.machine_model_list.length} machines`);
    }

    // Sort printers by brand then machine name
    printers.sort((a, b) => {
        if (a.brand < b.brand) return -1;
        if (a.brand > b.brand) return 1;
        return a.machine_name.localeCompare(b.machine_name);
    });

    const index = {
        brands,
        printers,
    };

    // Ensure output directory exists
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(index, null, 2), 'utf-8');
    console.log(`\nDone! Generated index with ${printers.length} printers from ${brands.length} brands.`);
    console.log(`Output: ${OUTPUT_FILE}`);
}

main();
