namespace cpp match_service

service Match{
    i32 add_player(1: i32 score, 2: string uuid, 3: string username, 4: string photo, 5: double px, 6: double py, 7: i32 total, 8: string channel_name),
    i32 remove_player(1: i32 score, 2: string uuid, 3: string username, 4: string photo, 5: double px, 6: double py, 7: string channel_name)
}
