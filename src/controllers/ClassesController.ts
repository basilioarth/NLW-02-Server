import { Request, Response } from 'express';

import db from '../database/connection';
import convertHourToMinutes from '../utils/convertHourToMinutes';

interface ScheduleItem {
    week_day: number;
    from: string;
    to: string;
}
// Interface que irá definir o formato de um objeto

export default class ClassesController {
    async index(request: Request, response: Response) {
        const filters = request.query;

        const subject = filters.subject as string;
        const week_day = filters.week_day as string;
        const time = filters.time as string;

        if(!filters.week_day || !filters.subject || !filters.time){
            return response.status(400).json({
                error: 'Missing filters to search classes'
            });
        }

        const timeInMinutes = convertHourToMinutes(time);

        const classes = await db('classes')
            .whereExists(function() {
                this.select('class_schedule.*')
                    .from('class_schedule')
                    .whereRaw('`class_schedule`.`class_id` = `classes`.`id`')
                    .whereRaw('`class_schedule`.`week_day` = ??', [Number(week_day)])
                    .whereRaw('`class_schedule`.`from` <= ??', [timeInMinutes])
                    .whereRaw('`class_schedule`.`to` > ??', [timeInMinutes])
            })
            .where('classes.subject', '=', subject)
            .join('users', 'classes.user_id', '=', 'users.id')
            .select(['classes.*', 'users.*']);

        return response.json(classes);
    }

    async create(request: Request, response: Response) {
        const {
            name,
            avatar,
            whatsapp,
            bio,
            subject,
            cost,
            schedule
        } = request.body;
    
        const trx = await db.transaction();
        // Habilita a propriedade de transição de banco. Isso faz com que todas as
        // operações ocorram ao mesmo tempo e, caso alguma deles falhe por algum
        // motivo, todas as outras anteriores sejam desfeitas.
        // Isso garante que não haja nenhuma informação que não se relacione com as
        // três entidades simultaneamente.
    
        try {
    
            const insertedUsersIds = await trx('users').insert({
                name,
                avatar,
                whatsapp,
                bio,
            });
            // O método insert devolve um array com os ids de todos os
            // elementos que foram inseridos
        
            const user_id = insertedUsersIds[0];
        
            const insertedClassesIds = await trx('classes').insert({
                subject,
                cost,
                user_id,
            });
        
            const class_id = insertedClassesIds[0];
        
            const classSchedule = schedule.map((scheduleItem: ScheduleItem) => {
                return {
                    class_id,
                    week_day: scheduleItem.week_day,
                    from: convertHourToMinutes(scheduleItem.from),
                    to: convertHourToMinutes(scheduleItem.to)
                };
            });
            // O método map vai percorrer cada uma dos elementos de um interável
            // e vai realizar alguma operação com cada um desses elementos.
            // O que vem antes da "=>" será o nome que cada elemento do interável
            // vai receber na sua vez. E depois do "=>" é o que acontecerá com
            // cada um deles 
        
            await trx('class_schedule').insert(classSchedule);
        
            await trx.commit();
            // É nesse momento que o trx insere tudo no banco de dados ao mesmo tempo
        
            return response.status(201).send();
            // O status 201 dentro do código http significa criado com sucesso
    
        }catch (err) {
    
            await trx.rollback();
            // Irá desfazer qualquer alteração que ocorreu no banco caso haja algum erro no processo
    
            return response.status(400).json({
                error: 'Unexpected error while creating new class'
            })
        }
    }
}