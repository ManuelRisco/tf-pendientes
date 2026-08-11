<?php

use Illuminate\Database\Eloquent\Model;

class Estado extends Model {
    protected $table = 'estados';
    public $timestamps = false;
    
    public function tareas() {
        return $this->hasMany(Tarea::class, 'estado_id');
    }
}
