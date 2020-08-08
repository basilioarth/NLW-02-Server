export default function convertHourToMinutes(time: string){
    const [hour, minutes] = time.split(':').map(Number);
    // Para cada item do array de dois elementos (lado esquerdo e direito dos ':')
    // teremos a sua transformação de string para número.
    // Fazemos uma desestruturação. O primeiro item do array vai para a variável hour. O segundo
    // vai pra variável minutos.
    const timeInMinutes = (hour * 60) + minutes;

    return timeInMinutes;
}