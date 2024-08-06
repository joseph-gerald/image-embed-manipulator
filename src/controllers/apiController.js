const path = require('path');
const fs = require('fs');

const { v4: uuidv4 } = require('uuid');

const registry = {};

async function getIPInfo(ip) {
    const url = `https://api.jooo.tech/ip?=${ip}`;

    const response = await fetch(url);
    const output = await response.json();

    return output;
}

exports.ping = (req, res) => {
    res.send('pong');
};

exports.getRobots = async (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'robot/robots.txt'));
};

exports.getRobotsMinified = async (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'robot/robots.min.txt'));
};

exports.uploadImage = async (req, res) => {
    if (!req.files || req.files.file === undefined) {
        res.status(400).send({ 'error': 'No file was sent' });
        return;
    }

    const { file } = req.files;
    const fileName = file.name;
    const fileExtension = path.extname(fileName);
    const allowedExtensions = ['.jpg', '.jpeg', '.png'];

    if (!allowedExtensions.includes(fileExtension)) {
        return res.status(400).send({ "error": "file type not allowed" });
    }

    const fileId = uuidv4() + fileExtension;
    const filePath = path.join(__dirname, '..', 'uploads', fileId);

    try {
        await fs.promises.writeFile(filePath, file.data);
    } catch (err) {
        console.error(err);
        return res.status(500).send({ "error": "error uploading file" });
    }

    setTimeout(() => {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }, 5 * 60 * 1000);

    res.send({ message: "success", id: fileId });
}

exports.publish = async (req, res) => {
    if (!req.body.files || req.body.files.length != 3) {
        return res.status(400).send({ "error": "no files sent" });
    }

    const fileIds = req.body.files;
    const filePaths = fileIds.map(fileId => path.join(__dirname, '..', 'uploads', fileId));

    const publishId = uuidv4();

    registry[publishId] = {
        embed_index: 0,
        files: {
            blur: filePaths[0],
            preview: filePaths[1],
            focus: filePaths[2],
        }
    }

    fs.writeFileSync(path.join(__dirname, '..', 'uploads', publishId), JSON.stringify(registry[publishId]));

    res.send({ message: "success", id: publishId });
}

exports.viewImage = async (req, res) => {
    const { id } = req.params;

    if (!registry[id]) {
        const filePath = path.join(__dirname, '..', 'uploads', id);

        if (fs.existsSync(filePath)) {
            registry[id] = JSON.parse(fs.readFileSync(filePath));
        } else {
            return res.status(404).send({ "error": "file not found" });
        }
    }

    const { files } = registry[id];

    const ua = req.headers['user-agent'];
    const connecting_ip = req.headers['cf-connecting-ip'] || req.connection.remoteAddress;
    const ip_info = await getIPInfo(connecting_ip);

    if (ip_info.isp == "Google LLC") {
        if (registry[id].embed_index < 2) {
            if (ua.includes('Discordbot')) {
                registry[id].embed_index = 0;

                return res.sendFile(files.blur);
            } else {
                registry[id].embed_index++;

                if (registry[id].embed_index == 1) {
                    return res.sendFile(files.preview);
                } else {
                    res.sendFile(files.focus);

                    setTimeout(() => {
                        fs.writeFileSync(path.join(__dirname, '..', 'uploads', id), JSON.stringify(registry[id]));

                        for (const file of Object.values(files)) {
                            fs.unlinkSync(file);
                        }

                        fs.unlinkSync(path.join(__dirname, '..', 'uploads', id));
                    }, 5000);
                    return;
                }
            }
        }
    }

    res.status(410).send({ "error": "gone" });
}