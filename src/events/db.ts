import PostgresDB from "../config/database/postgres";

class EventsDB {
    public createEventsQuery = async (data: any) => {
        const query = PostgresDB.formatInsert(`INSERT INTO events ?`, data);
        const { rows } = await PostgresDB.query(query.query, query.params);

        return rows as unknown as any;
    };
}

export default EventsDB;
