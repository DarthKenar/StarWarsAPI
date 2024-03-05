import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from "typeorm"

@Entity()
export class Films {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    title: string

    @Column()
    episode_id: number

    @ManyToMany(type => People, people => people.films)
    @JoinTable()
    characters: People[]

}

@Entity()
export class People {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @Column()
    gender: string

    @Column()
    species: string

    @ManyToMany(type => Films, film => film.characters)
    @JoinTable()
    films: Films[]
    
}