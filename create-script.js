import { argv } from 'yargs';
import fs from 'fs';

if (!argv.name || !(argv.type === 'bot' || argv.type === 'slash')) {
  console.log('Name and type are required');
} else {
  const filePath = `matchers/${argv.type}/${argv.name.replace(' ', '-')}.js`;
  fs.stat(filePath, err => {
    if (err) {
      fs.readFile(`templates/${argv.type}.js.template`, 'utf-8', (e, data) => {
        if (e) {
          console.log(err);
        } else {
          const replaced = data.replace('%NAME%', argv.name);
          fs.writeFile(filePath, replaced, error => {
            if (error) {
              console.log(error);
            } else {
              console.log(filePath, 'created!');
            }
          });
        }
      });
    } else {
      console.log('A script of that name and type already exists');
    }
  });
}
