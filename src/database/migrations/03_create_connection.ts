import Knex from 'knex';

export async function up(knex: Knex) {
    return knex.schema.createTable('connections', table => {
        table.increments('id').primary();

        table.integer('user_id')
            .notNullable()
            .references('id')
            .inTable('users')
            .onUpdate('CASCADE')
            /* elemento que indica o que vai acontecer com o id do usuário dentro
            da tabela de usuário_aulas quando o id for modificado lá na tabela de
            usuários. O CASCADE faz com que os ids da tabela de relacionamento 
            sejam atualizados quando o respectivo id da tabela de usuários for
            atualizado. */
            .onDelete('CASCADE');
            /* elemento que indica o que vai acontecer com as aulas de um professor
            caso ele seja excluido. O CASCADE faz com que todas as aulas associadas
            a esse professor deletado também sejam deletadas. */
        
        table.timestamp('created_at')
        // campo que registrará o momento de conexão entre o professor e o aluno
            .defaultTo(knex.raw('CURRENT_TIMESTAMP'))
            .notNullable();
    });
}

export async function down(knex: Knex) {
   return knex.schema.dropTable('connections');
}