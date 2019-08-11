import * as commander from 'commander';

import { convertFolder } from './convertFolder';
import { convertRepository } from './convertRepository';
import { VERSION } from './config';

export interface GlobalOptions {
  readonly recast: boolean;
  readonly prettier: boolean;
}

export interface ConvertFolderOptions {
  readonly allowJs: boolean;
  readonly remove: boolean;
  readonly parent: GlobalOptions;
}
export interface ConvertRepositoryOptions {
  readonly parent: GlobalOptions;
}

const program = new commander.Command();

program
  .name('flowts')
  .version(VERSION)
  .description('Flow to TypeScript migration toolkit.')
  .option('-R, --no-recast', 'use babel generator instead of recast', false)
  .option('-P, --no-prettier', 'do not run prettier on converted code', false);

const handleCommandPromise = (p: Promise<any>) => {
  p.then(
    () => {
      console.log('done');
      process.exit(0);
    },
    e => {
      console.error(e);
      process.exit(1);
    }
  );
};

program
  .command('folder <folders...>')
  .description('Convert all files in specified folders')
  .usage('./src ./test')
  .option(
    '--no-allow-js',
    'convert all js files, including without flow to TypeScript',
    false
  )
  .option(
    '--no-remove',
    'keep js files after appropriate ts files were created',
    false
  )
  .action((dirs: string[], options: ConvertFolderOptions) => {
    handleCommandPromise(
      (async () => {
        for (const dir of dirs) {
          await convertFolder(dir, options);
        }
      })()
    );
  });

program
  .command('repository <path>')
  .description('Migrate project at specified path')
  .usage('path/to/git/repository')
  .action((dir: string, options: ConvertRepositoryOptions) => {
    handleCommandPromise(convertRepository(dir, options));
  });

program.on('command:*', function() {
  console.error(
    'Invalid command: %s\nSee --help for a list of available commands.',
    program.args.join(' ')
  );
  process.exit(1);
});

program.parse(process.argv);

if (program.args.length === 0) {
  console.error(
    'Command not specified\nSee --help for a list of available commands.',
    program.args.join(' ')
  );
  process.exit(1);
}
