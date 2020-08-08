import knex from 'knex';
import path from 'path';
// biblioteca que ajuda a gerenciar os caminhos da nossa aplicação

// migrations: controlam a versão do banco de dados
// dentro delas é que vamos descrever o que exatamente queremos fazer com o banco

const db = knex({
    client: 'sqlite3',
    connection: {
        filename: path.resolve(__dirname, 'database.sqlite')
        //__dirname: retorna o diretório onde está o arquivo que executa o __dirname
        //cria o arquivo 'database.sqlite' no diretório deste arquivo em questão (o diretório database)
    },
    useNullAsDefault: true,
    // elemento disponível somente para o banco sqlite, pois o mesmo, por padrão, não consegue identificar um
    // valor fixo a ser atribuído aos campos não preenchidos
});

export default db;