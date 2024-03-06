import { Entity, PrimaryGeneratedColumn, PrimaryColumn, Column, ManyToMany, JoinTable } from "typeorm"

@Entity()
export class Films {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    title: string

    @Column()
    episode_id: number

}

@Entity()
export class PeopleInFilms {
    
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    film_id: number

    @Column()
    people_id: number

}

@Entity()
export class People {

    @PrimaryColumn()
    idAPI: number

    @Column()
    name: string

    @Column()
    gender: string

    @Column()
    species: string
    
}