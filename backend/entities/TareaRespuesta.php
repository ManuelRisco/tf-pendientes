<?php

use Illuminate\Database\Eloquent\Model;

class TareaRespuesta extends Model {
    protected $table = 'tarea_respuestas';
    protected $fillable = [
        'tarea_id',
        'admin_id',
        'mensaje',
        'created_at'
    ];

    public $timestamps = false;

    public function tarea() {
        return $this->belongsTo(Tarea::class, 'tarea_id');
    }

    public function usuario() {
        return $this->belongsTo(Usuario::class, 'admin_id');
    }
}
