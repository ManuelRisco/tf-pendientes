<?php

use Illuminate\Database\Eloquent\Model;

class Prioridad extends Model {
    protected $table = 'prioridades';
    public $timestamps = false;
    
    public function tareas() {
        return $this->hasMany(Tarea::class, 'prioridad_id');
    }
}
